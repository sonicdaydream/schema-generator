'use client';

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <a href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← トップに戻る
          </a>
          <h1 className="text-4xl font-bold mb-4">使い方ガイド</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            構造化データ自動生成ツールの使い方を3ステップで解説します
          </p>
        </div>

        {/* ステップ1 */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              1
            </span>
            <h2 className="text-2xl font-bold">URLを入力</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            構造化データを生成したいWebページのURLを入力してください。
          </p>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
            <p className="text-sm font-mono">例: https://example.com/article</p>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <strong>対応するページタイプ:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>ブログ記事・ニュース記事 → Article</li>
              <li>商品ページ → Product</li>
              <li>企業・組織サイト → Organization</li>
              <li>店舗・事業所 → LocalBusiness</li>
              <li>イベント情報 → Event</li>
              <li>レシピページ → Recipe</li>
              <li>FAQ・Q&Aページ → FAQPage</li>
            </ul>
          </div>
        </section>

        {/* ステップ2 */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              2
            </span>
            <h2 className="text-2xl font-bold">生成する</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            「生成する」ボタンをクリックすると、AIが自動的にページを解析します。
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 rounded">
            <p className="text-sm">
              ⏱️ 生成には通常5〜15秒かかります。複雑なページの場合、もう少し時間がかかることがあります。
            </p>
          </div>
        </section>

        {/* ステップ3 */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              3
            </span>
            <h2 className="text-2xl font-bold">コードをコピー</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            生成されたJSON-LDコードを「コピー」ボタンでクリップボードにコピーし、WebページのHTMLに貼り付けます。
          </p>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mb-4">
            <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mb-2">
              &lt;head&gt;
            </p>
            <p className="text-sm font-mono ml-4 text-blue-600">
              &lt;!-- ここに生成されたコードを貼り付け --&gt;
            </p>
            <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mt-2">
              &lt;/head&gt;
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 p-4 rounded">
            <p className="text-sm">
              💡 <strong>ヒント:</strong> &lt;head&gt;タグ内ならどこでもOKです。既存のコードの下に追加してください。
            </p>
          </div>
        </section>

        {/* 検証 */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">🔍 実装後の検証</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            コードを実装したら、必ずGoogleのツールで検証しましょう:
          </p>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <div>
                <a
                  href="https://search.google.com/test/rich-results"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Googleリッチリザルトテスト
                </a>
                <span className="text-gray-600 dark:text-gray-400"> にアクセス</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <span className="text-gray-600 dark:text-gray-400">
                実装したページのURLを入力
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <span className="text-gray-600 dark:text-gray-400">
                「URLをテスト」をクリック
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">4.</span>
              <span className="text-gray-600 dark:text-gray-400">
                エラーがないか確認
              </span>
            </li>
          </ol>
        </section>

        {/* よくある質問 */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">❓ よくある質問</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">Q. どんなサイトでも使えますか?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                A. 公開されているWebページであれば使えます。ただし、ログインが必要なページや、アクセス制限がかかっているページは解析できません。
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Q. 生成に失敗する場合は?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                A. 以下を確認してください:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>URLが正しく入力されているか</li>
                <li>ページが公開されているか</li>
                <li>ページの内容が十分にあるか（テキストが極端に少ないページは判定できない場合があります）</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-2">Q. SEO効果はいつ出ますか?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                A. Googleがページを再クロールするタイミングによりますが、通常1週間〜1ヶ月程度で検索結果に反映されます。Google Search Consoleで確認できます。
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Q. 複数ページに一括で設定できますか?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                A. 現在のMVP版では1ページずつの生成となります。サイト全体の一括生成機能は今後追加予定です。
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Q. WordPressで使えますか?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                A. はい。生成されたコードを「外観」→「テーマエディター」→「header.php」の&lt;head&gt;タグ内に貼り付けてください。または、プラグイン「Insert Headers and Footers」を使うと簡単です。
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Q. 無料で使えますか?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                A. はい、現在はベータ版として無料でご利用いただけます。
              </p>
            </div>
          </div>
        </section>

        {/* 具体例 */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">💡 活用例</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold mb-2">📝 ブログ記事</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                記事に構造化データを追加することで、検索結果に著者名、公開日、画像などが表示される可能性が高まります。
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold mb-2">🛍️ ECサイト</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                商品ページに価格、在庫状況、レビュー評価などを構造化データで追加し、リッチスニペットを表示。
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold mb-2">🏢 企業サイト</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                会社情報を正確に検索エンジンに伝え、ナレッジパネルでの表示を最適化。
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold mb-2">📍 店舗サイト</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                営業時間、住所、電話番号などをマークアップし、ローカル検索での表示を改善。
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-blue-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">さあ、始めましょう!</h2>
          <p className="mb-6">
            たった3ステップで、あなたのサイトのSEOを改善できます
          </p>
          <a
            href="/"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            ツールを使ってみる →
          </a>
        </div>
      </main>
    </div>
  );
}
