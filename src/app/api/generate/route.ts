import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini APIクライアントの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URLが指定されていません' },
        { status: 400 }
      );
    }

    // URLの検証
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: '有効なURLを入力してください' },
        { status: 400 }
      );
    }

    // ページの内容を取得
    const pageData = await fetchPageContent(url);

    // Gemini APIでページタイプを判定し、構造化データを生成
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      }
    });

    const prompt = `あなたはSEOの専門家です。提供されたURLのコンテンツを解析し、Googleのリッチリザルト獲得とE-E-A-T（信頼性）向上に貢献する、SEO価値が最も高く、包括的なJSON-LD形式の構造化データを自動で生成してください。

URL: ${url}

ページのメタデータ（OGP画像などの抽出に使用）:
${pageData.metadata}

既存の構造化データ（参考情報として活用。価格・レビュー情報がある場合は優先的に使用）:
${pageData.existingJsonLd || 'なし'}

ページ内容:
${pageData.text.substring(0, 5000)}

---

### 必須ルール
- 出力は、説明文や謝辞などを一切含まず、JSON-LDコードブロックのみを厳密に出力してください
- 生成する構造化データは https://schema.org に厳密に準拠している必要があります
- 出力形式は以下のJSON形式で返してください:
{
  "pageType": "判定したSchemaタイプ（複数の場合はカンマ区切り、例: Organization, WebSite）",
  "confidence": 0.95,
  "schema": "JSON-LDコード(scriptタグを含む文字列。複数のスキーマがある場合は、それぞれ別のscriptタグで記述し、改行で連結)"
}

### 構造化データの選定ロジック(@typeの決定)
コンテンツを詳細に精査し、そのページに最も関連性の高いスキーマタイプを選択してください。

**判定の優先順位:**
1. 商品詳細ページ（ECサイトの個別商品ページ）: Product を使用
   - 価格表示、カートボタン、商品説明がある場合は Product を最優先
   - 例: 「¥1,980」「カートに入れる」「在庫あり」などのキーワード
2. メインの企業サイト/ホームページ: Organization を使用
   - サイト内検索機能がある大規模サイト（ECサイト、ポータルサイト等）の場合は、Organization に加えて WebSite スキーマも必ず追加生成すること
3. ブログ記事、ニュース、プレスリリース: Article を使用
4. FAQ (よくある質問) ページ: FAQPage を使用し、質問と回答のペアを抽出

### 抽出プロパティの優先順位（SEO価値の向上）
単に name や url を繰り返すのではなく、Googleのクロールとナレッジグラフ構築に役立つリッチな情報を優先的に抽出してください。

#### 1. 組織情報 (Organization) の場合の最終ロジック

- 必須: name, url
- ロゴ画像 (logo): OGP画像 (og:image) を最優先し、そのURLを抽出する（SVG埋め込みの場合は、og:image が見つからなければ省略）
- 説明 (description): メタディスクリプションや主要なコンテンツから、組織の簡潔な説明文を抽出

- 🚨 外部関連エンティティリンク (sameAs) の抽出ロジックを厳格化
  1. 【絶対的な禁止事項】sameAs フィールドには、対象サイト自身のURL (url フィールドと同じ値) を決して含めてはいけません
  2. 抽出対象: HTMLコンテンツ全体（特にフッターやヘッダー）から、以下の外部公式アカウントへのリンクを必ず探し、そのURLを配列として格納してください
     - X (Twitter)、Facebook、LinkedIn
     - YouTube、Wikipedia (当該企業に関する記事)
  3. これらの外部リンクが一つも見つからなかった場合は、sameAs フィールド全体を省略してください

- 推奨: 連絡先 (contactPoint) や所在地 (address) を抽出

#### 2. 記事情報 (Article) の場合:
- 必須: headline (タイトル)、image (メイン画像)、datePublished (公開日)、author (著者名/組織名) を抽出

#### 2.5. 商品情報 (Product) の場合:
- 必須: name (商品名), description (商品説明), image (商品画像)
- offers フィールド (価格情報):
  - price: 価格（数値のみ、カンマや通貨記号を除去）
  - priceCurrency: 通貨コード（例: JPY, USD）
  - availability: 在庫状況（https://schema.org/InStock または https://schema.org/OutOfStock）
  - url: 商品ページURL
  - seller: 商品を販売しているサイト/ショップ（Organization形式）
    - 例: ECサイト名、モール名（スーパーデリバリー、Amazon、楽天市場など）
    - 形式: "seller": { "@type": "Organization", "name": "サイト名" }
- 推奨: 
  - sku: 商品番号/SKU
  - gtin13 または gtin: JANコード（13桁の数字）
  - aggregateRating: レビュー情報（下記の詳細ルール参照）

🚨 価格 (offers.price) の取得ルール【最重要・厳守】:
- 価格の取得優先順位:
  1. 既存のJSON-LD構造化データ内の offers.price
  2. metaタグ (product:price:amount, og:price:amount 等)
  3. ページ本文から「¥3,990」「3,990円」「税込 3,990」などのパターンを抽出
- 🚫 絶対禁止事項:
  - 価格を推測・仮定・捏造することは絶対に禁止
  - "0" や "1" などのプレースホルダー値を設定することは禁止
  - 価格が明確に見つからない場合、offers フィールド全体を必ず省略すること
- ⚠️ SPA（シングルページアプリケーション）サイトの注意:
  - ユニクロ、ZOZOTOWN、楽天等の大手ECサイトは、価格がJavaScriptで動的表示されるため、取得できないことがある
  - ページ本文に価格らしき数値（例: 3990, 1980等）が見つからない場合は、SPAサイトと判断し、offers を省略すること
- 価格が取得できた場合は、必ず正の整数（カンマ・通貨記号なし）で設定すること

🚨 レビュー情報 (aggregateRating) の取得ルール【最重要・厳守】:
- レビュー情報の取得優先順位:
  1. 既存のJSON-LD構造化データ内の aggregateRating
  2. ページ本文から「★4.5」「4.5点」「(255件)」「レビュー255件」などのパターンを抽出
- 🚫 絶対禁止事項:
  - レビュー情報を推測・仮定・捏造することは絶対に禁止
  - ratingValue と reviewCount の両方が明確に見つからない場合は、aggregateRating を省略すること
- ⚠️ SPAサイトではレビュー情報も動的表示のため取得できないことがある
- aggregateRating は Product スキーマの直下に配置（offers の中ではない）
- 必須プロパティ:
  - @type: "AggregateRating"
  - ratingValue: 総合評価点（例: "4.5"）
  - reviewCount: レビュー総数（例: "255"）
- 形式例:
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "255"
  }
- レビュー情報が見つからない、または不完全な場合は aggregateRating を省略すること

🚨 brand プロパティの重要ルール:
- brand には商品の「製造元」または「ブランド名」のみを設定すること
- 販売プラットフォーム（スーパーデリバリー、Amazon、楽天市場、Yahoo!ショッピング等）は brand ではなく、offers 内の seller として定義すること
- 商品ページから真のブランド名/製造元が明確に特定できない場合は、brand プロパティを出力しないこと（推測や捏造は禁止）
- 例: 「CACAO BITE」というブランドの商品がスーパーデリバリーで販売されている場合
  - ✅ 正しい: brand = "CACAO BITE", seller = "スーパーデリバリー"
  - ❌ 間違い: brand = "スーパーデリバリー"

#### 3. サイトリンク検索ボックス (WebSite) スキーマの追加:
- 提供されたURLが、広範な検索機能を提供する大規模なプラットフォームサイト（例: ECサイト、ポータルサイトなど）であると判断した場合、Organization スキーマとは別に、WebSite スキーマを必ず追加で生成すること
- WebSite スキーマは、そのサイトの検索窓が利用する検索結果ページのURL構造を解析し、SearchAction プロパティ内に、urlTemplate を使用して検索クエリが挿入される形を記述すること
  - 例: サイト内検索で「テスト」と検索したURLが https://example.com/search?q=テスト だった場合、urlTemplate は https://example.com/search?q={search_term_string} とすること
  - 検索窓が見つからない場合は、WebSiteスキーマは生成しない

### 🚨 ロゴ画像抽出の特殊ルール（SVG埋め込み対策）
ロゴのURLを抽出する際は、以下の優先順位に従ってください。

1. 最優先: まず、HTMLの <head> 内にある og:image メタタグを探し、そのURLをロゴとして抽出できるか確認する
2. 次点: og:image が見つからない場合のみ、引き続き <img> タグなどからロゴの直接リンクを探す
3. インラインSVG (<svg>...</svg>) を検出した場合は、URLが存在しないため、抽出を試みず、すぐに次の優先順位に進むこと。また、そのSVGコードを logo フィールドの値として含めることはしないこと

### 品質ガードレール（ハルシネーション対策）【最重要】
- 信頼できる情報源（HTML、メタタグ、コンテンツ内の明記されたデータ）から確実に見つけられなかった情報は、推測や捏造を行わず、そのフィールド全体をJSON-LDから省略してください
- データが空になることを恐れず、検証可能な情報のみを含めることを最優先とします
- 日本語のページの場合は日本語の情報を優先してください
- ⚠️ SPAサイト（ユニクロ、ZOZOTOWN、楽天等）では、価格・レビュー・在庫情報がJavaScriptで動的に表示されるため、ページ本文から取得できないことがあります。その場合は該当フィールドを省略してください
- 🚫 price: "0" や aggregateRating の捏造は、Googleのリッチリザルトを無効化する致命的エラーです。不確かな情報は絶対に出力しないでください

### 重要な注意事項
- Reviewスキーマは単体では生成しないでください（Productの一部としてのみ使用可能）
- 複数のスキーマを1つのscriptタグに混在させないでください
- JSON形式のみを返してください（Markdownのコードブロックは不要）`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      // JSON出力モードを使用しているので、直接パース可能なはず
      const parsedResponse = JSON.parse(text);
      
      // 必須フィールドの検証
      if (!parsedResponse.pageType || !parsedResponse.schema) {
        throw new Error('AIの応答に必要な情報が含まれていません');
      }
      
      return NextResponse.json(parsedResponse);
    } catch (parseError: any) {
      // パースに失敗した場合、JSONを探して再試行
      console.log('Direct parse failed, trying to extract JSON...');
      
      // Markdownのコードブロックを除去
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // JSONオブジェクトを抽出
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Failed to extract JSON from:', text.substring(0, 200));
        throw new Error('AIからの応答を解析できませんでした');
      }

      let jsonString = jsonMatch[0];
      
      // 制御文字を除去
      jsonString = jsonString
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .trim();
      
      try {
        const parsedResponse = JSON.parse(jsonString);
        
        if (!parsedResponse.pageType || !parsedResponse.schema) {
          throw new Error('AIの応答に必要な情報が含まれていません');
        }
        
        return NextResponse.json(parsedResponse);
      } catch (secondError: any) {
        console.error('JSON parse error:', secondError);
        console.error('Attempted to parse:', jsonString.substring(0, 500));
        throw new Error(`応答の解析に失敗しました: ${secondError.message}`);
      }
    }
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || '生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ページコンテンツを取得する関数
async function fetchPageContent(url: string): Promise<{ text: string; metadata: string; existingJsonLd: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error(`Fetch failed: ${response.status} ${response.statusText} for URL: ${url}`);
      throw new Error(`ページの取得に失敗しました: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // メタデータを抽出（OGP画像などのため）
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const headContent = headMatch ? headMatch[1] : '';
    
    // 重要なメタタグを抽出（価格・レビュー関連も追加）
    const metaTags = headContent.match(/<meta[^>]+>/gi) || [];
    const relevantMeta = metaTags
      .filter(tag => 
        tag.includes('og:image') || 
        tag.includes('og:title') || 
        tag.includes('og:description') ||
        tag.includes('twitter:image') ||
        // 価格関連メタタグ
        tag.includes('product:price') ||
        tag.includes('og:price') ||
        tag.includes('price') ||
        // レビュー関連メタタグ
        tag.includes('rating') ||
        tag.includes('review')
      )
      .join('\n');

    // 既存のJSON-LD構造化データを抽出（参考情報として）
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    const existingJsonLd = jsonLdMatches
      .map(match => {
        const content = match.replace(/<script[^>]*>|<\/script>/gi, '').trim();
        try {
          // 有効なJSONかチェック
          JSON.parse(content);
          return content;
        } catch {
          return '';
        }
      })
      .filter(Boolean)
      .join('\n---\n');

    // HTMLから不要なタグを除去してテキストを抽出
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      text: textContent,
      metadata: relevantMeta,
      existingJsonLd: existingJsonLd
    };
  } catch (error: any) {
    console.error('fetchPageContent error:', error.message || error);
    throw new Error(`ページの取得に失敗しました: ${error.message || 'URLを確認してください。'}`);
  }
}
