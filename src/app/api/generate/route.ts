import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URLが指定されていません" },
        { status: 400 }
      );
    }

    // URLからHTMLを取得
    const response = await fetch(url);
    const html = await response.text();

    // Gemini APIでSchema.orgデータを生成
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    const prompt = `あなたはSEOとSchema.org構造化データの専門家です。以下のHTMLから、Google検索でのリッチリザルト表示を最適化するため、Schema.org準拠のJSON-LD構造化データを生成してください。

入力されたURL: ${url}

HTMLコンテンツ:
${html.substring(0, 50000)}

# 重要な指示

## 1. スキーマタイプの自動判定

HTMLの内容を分析し、以下の優先順位で**最も適切なスキーマタイプ**を判定してください:

1. **Organization (企業・組織サイト):**
   - 企業情報、会社概要、サービス紹介が主な内容
   - 企業サイトのトップページやAboutページ
   - **ECサイトの場合でも、企業情報が含まれていればOrganizationを生成**

2. **Article (記事・ブログ):**
   - ブログ記事、ニュース記事、コラム
   - 明確な見出し、本文、公開日がある

3. **Product (商品ページ):**
   - 商品の詳細ページ
   - 価格、在庫状況、商品説明がある

4. **FAQPage:**
   - よくある質問ページ
   - 質問と回答のセットが複数ある

## 2. WebSiteスキーマの追加判定 (ECサイト・企業サイト向け)

以下の条件を**すべて満たす場合のみ**、Organizationに加えて**WebSiteスキーマも生成**してください:

**必須条件:**
- サイトに検索機能がある (検索ボックス、検索フォームが存在)
- 検索URLのパターンが明確に特定できる

**検索URLパターンの抽出ルール:**
1. HTMLから \`<form>\` タグで \`action\` 属性に検索URLがある場合、そのパターンを使用
2. サイト内リンクに \`/search?q=\`, \`?s=\`, \`/search/\` などの検索パターンがある場合、それを使用
3. 一般的なECサイトの検索パターン:
   - \`https://example.com/search?q={search_term_string}\`
   - \`https://example.com/?s={search_term_string}\`
   - \`https://example.com/search/{search_term_string}\`

**注意:** 検索機能が明確でない場合や、検索URLパターンが不明な場合は、WebSiteスキーマを生成しない。

## 3. 各スキーマの必須プロパティ

### Organization (企業・組織)

- **@type:** "Organization"
- **name:** 企業名・組織名
- **url:** 入力されたURL (${url})
- **logo (推奨):**
  - まず、HTMLの \`<meta property="og:image">\` からOGP画像を抽出
  - OGP画像がない、または不適切な場合のみ、\`<img>\` タグから企業ロゴを探す
  - **⚠️ インラインSVGは絶対に使用しない** (data:image/svg... で始まるURLは除外)
  - **⚠️ 不確実な場合は省略する** (404エラーになる可能性があるURLは含めない)
- **description (推奨):** 企業・組織の説明文
  - meta descriptionがあれば優先
  - なければサイトの説明文を簡潔に抽出
- **sameAs (必須・超重要):**
  - SNS公式アカウント、Wikipedia、公式の外部サイトへのリンクを優先的に抽出
  - **🚨 厳格な除外ルール:**
    * 抽出した各URLが、入力されたサイトのメインURL (${url}) と完全に一致していないか検証すること
    * 末尾のスラッシュ (\`/\`) の有無、\`www\` の有無を無視して比較
    * 実質的に同一URLであれば必ず除外すること
    * 例: 入力URLが \`https://www.anthropic.com/\` の場合、以下は全て除外:
      - \`https://www.anthropic.com/\`
      - \`https://www.anthropic.com\`
      - \`https://anthropic.com/\`
      - \`https://anthropic.com\`
  - **外部SNSリンクや関連サイトのみ**を含めること (Twitter/X, LinkedIn, Facebook, YouTube, 関連プロダクトサイト等)
  - 見つからない場合は空配列 \`[]\`
- **contactPoint (推奨):**
  - 電話番号、メールアドレス、問い合わせフォームのURL
  - ない場合は省略
- **address (推奨):**
  - 所在地情報
  - ない場合は省略

### WebSite (検索機能があるサイト)

- **@type:** "WebSite"
- **name:** サイト名
- **url:** 入力されたURL (${url})
- **potentialAction:**
  - **@type:** "SearchAction"
  - **target:**
    - **@type:** "EntryPoint"
    - **urlTemplate:** 検索URLパターン (例: "https://example.com/search?q={search_term_string}")
  - **query-input:** "required name=search_term_string"

### Article (記事・ブログ)

- **@type:** "Article" (または "BlogPosting", "NewsArticle")
- **headline:** 記事タイトル
- **author:** 著者情報
- **datePublished:** 公開日
- **dateModified:** 更新日 (あれば)
- **image:** 記事のメイン画像 (OGP画像を優先)
- **publisher:** 発行者情報 (Organizationとして)

### Product (商品ページ)

- **@type:** "Product"
- **name:** 商品名
- **image:** 商品画像 (OGP画像を優先)
- **description:** 商品説明
- **offers:** 価格情報 (あれば)
- **brand:** ブランド名 (あれば)

### FAQPage

- **@type:** "FAQPage"
- **mainEntity:** 質問と回答のリスト
  - 各項目は \`@type: "Question"\` で、\`acceptedAnswer\` を含む

## 4. 出力形式

**複数のスキーマを生成する場合:**
- JSON配列として出力: \`[{...Organization...}, {...WebSite...}]\`

**単一のスキーマの場合:**
- 単一のJSONオブジェクトとして出力: \`{...}\`

**必ず以下の形式で出力してください:**

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "スキーマタイプ",
  ... (他のプロパティ)
}
\`\`\`

または複数の場合:

\`\`\`json
[
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    ...
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    ...
  }
]
\`\`\`

**⚠️ 重要:** JSONのみを出力してください。説明文やマークダウンの \`\`\`json\` タグは含めないでください。`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // JSONパース (複数段階で試行)
    let schema;
    try {
      // まず直接パース
      schema = JSON.parse(responseText);
    } catch (e) {
      try {
        // マークダウンのコードブロックを除去してパース
        const cleaned = responseText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        schema = JSON.parse(cleaned);
      } catch (e2) {
        console.error("JSON parse error:", e2);
        return NextResponse.json(
          {
            error: "構造化データの生成に失敗しました",
            details: responseText.substring(0, 500),
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ schema });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "不明なエラー";
    console.error("Error:", errorMessage);
    return NextResponse.json(
      { error: "エラーが発生しました", details: errorMessage },
      { status: 500 }
    );
  }
}