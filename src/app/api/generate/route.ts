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

1. メインの企業サイト/ホームページ: Organization を使用
   - サイト内検索機能がある大規模サイト（ECサイト、ポータルサイト等）の場合は、Organization に加えて WebSite スキーマも必ず追加生成すること
2. ブログ記事、ニュース、プレスリリース: Article を使用
3. 特定の商品やサービス紹介ページ: Product を使用し、可能な限り review や offers も抽出
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

#### 3. サイトリンク検索ボックス (WebSite) スキーマの追加:
- 提供されたURLが、広範な検索機能を提供する大規模なプラットフォームサイト（例: ECサイト、ポータルサイトなど）であると判断した場合、Organization スキーマとは別に、WebSite スキーマを必ず追加で生成すること
- WebSite スキーマは、そのサイトの検索窓が利用する検索結果ページのURL構造を解析し、SearchAction プロパティ内に、urlTemplate を使用して検索クエリが挿入される形を記述すること
  - 例: サイト内検索で「テスト」と検索したURLが https://example.com/search?q=テスト だった場合、urlTemplate は https://example.com/search?q={search_term_string} とすること
  - 検索窓が見つからない場合は、WebSiteスキーマは生成しない

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

### 品質ガードレール（ハルシネーション対策）
- 信頼できる情報源（HTML、メタタグ、コンテンツ内の明記されたデータ）から確実に見つけられなかった情報は、推測や捏造を行わず、そのフィールド全体をJSON-LDから省略してください
- データが空になることを恐れず、検証可能な情報のみを含めることを最優先とします
- 日本語のページの場合は日本語の情報を優先してください

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
async function fetchPageContent(url: string): Promise<{ text: string; metadata: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SchemaGenerator/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`ページの取得に失敗しました: ${response.status}`);
    }

    const html = await response.text();

    // メタデータを抽出（OGP画像などのため）
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const headContent = headMatch ? headMatch[1] : '';
    
    // 重要なメタタグを抽出
    const metaTags = headContent.match(/<meta[^>]+>/gi) || [];
    const relevantMeta = metaTags
      .filter(tag => 
        tag.includes('og:image') || 
        tag.includes('og:title') || 
        tag.includes('og:description') ||
        tag.includes('twitter:image')
      )
      .join('\n');

    // HTMLから不要なタグを除去してテキストを抽出
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      text: textContent,
      metadata: relevantMeta
    };
  } catch (error) {
    throw new Error('ページの取得に失敗しました。URLを確認してください。');
  }
}
