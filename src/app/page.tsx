'use client';

import { useState, useEffect } from 'react';

// 履歴の型定義
interface HistoryItem {
  url: string;
  pageType: string;
  schema: string;
  timestamp: number;
}

// サンプルURL集
const SAMPLE_URLS = [
  { label: '企業サイト例', url: 'https://toyota.jp' },
  { label: 'ブログ記事例', url: 'https://zenn.dev' },
  { label: 'ECサイト例', url: 'https://www.superdelivery.com' },
];

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 履歴をlocalStorageから読み込み
  useEffect(() => {
    const savedHistory = localStorage.getItem('schema-generator-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 履歴を保存
  const saveToHistory = (newResult: any) => {
    const schemaString = typeof newResult.schema === 'string' 
      ? newResult.schema 
      : JSON.stringify(newResult.schema, null, 2);
    
    const newItem: HistoryItem = {
      url: url,
      pageType: newResult.pageType || 'Unknown',
      schema: schemaString,
      timestamp: Date.now(),
    };
    const updatedHistory = [newItem, ...history].slice(0, 10); // 最新10件のみ保持
    setHistory(updatedHistory);
    localStorage.setItem('schema-generator-history', JSON.stringify(updatedHistory));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成に失敗しました');
      }

      setResult(data);
      saveToHistory(data); // 履歴に保存
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.schema) {
      const schemaString = typeof result.schema === 'string' 
        ? result.schema 
        : JSON.stringify(result.schema, null, 2);
      navigator.clipboard.writeText(schemaString);
      alert('コピーしました!');
    }
  };

  // Googleリッチリザルトテストで検証
  const validateWithGoogle = () => {
    if (url) {
      const testUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`;
      window.open(testUrl, '_blank');
    }
  };

  // Schema.org Validatorで検証
  const validateWithSchemaOrg = () => {
    // Schema.org ValidatorはコードをURLパラメータで渡せないので、
    // 新しいタブでツールを開く
    window.open('https://validator.schema.org/', '_blank');
    // コードをクリップボードにコピーして、ユーザーが貼り付けやすくする
    if (result?.schema) {
      const schemaString = typeof result.schema === 'string' 
        ? result.schema 
        : JSON.stringify(result.schema, null, 2);
      navigator.clipboard.writeText(schemaString);
      // 少し遅延してからアラート表示
      setTimeout(() => {
        alert('コードをクリップボードにコピーしました!\n開いたページに貼り付けて検証してください。');
      }, 500);
    }
  };

  // 履歴から復元
  const loadFromHistory = (item: HistoryItem) => {
    setUrl(item.url);
    setResult({
      pageType: item.pageType,
      schema: item.schema,
    });
    setShowHistory(false);
  };

  // サンプルURLをセット
  const setSampleUrl = (sampleUrl: string) => {
    setUrl(sampleUrl);
  };

  // スキーマを文字列として取得
  const getSchemaString = () => {
    if (!result?.schema) return '';
    return typeof result.schema === 'string' 
      ? result.schema 
      : JSON.stringify(result.schema, null, 2);
  };

  // ページタイプを取得
  const getPageType = () => {
    if (!result?.schema) return 'Unknown';
    
    // schemaが文字列の場合、パースしてから取得
    if (typeof result.schema === 'string') {
      try {
        const parsed = JSON.parse(result.schema);
        if (Array.isArray(parsed)) {
          const types = parsed.map(s => s?.['@type']).filter(Boolean).join(', ');
          return types || 'Multiple';
        }
        return parsed?.['@type'] || 'Unknown';
      } catch (e) {
        return result.pageType || 'Unknown';
      }
    }
    
    // schemaがオブジェクトの場合
    if (typeof result.schema === 'object') {
      // 配列の場合は最初の要素の@type
      if (Array.isArray(result.schema)) {
        const types = result.schema.map(s => s?.['@type']).filter(Boolean).join(', ');
        return types || 'Multiple';
      }
      // 単一オブジェクトの場合
      return result.schema['@type']?.toString() || 'Unknown';
    }
    
    return result.pageType || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            構造化データ自動生成ツール
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
            URLを入力するだけで、最適な構造化データ(JSON-LD)を自動生成
          </p>
        </div>

        {/* タブ */}
        <div className="flex gap-2 mb-6 justify-center">
          <button
            onClick={() => setShowHistory(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !showHistory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            生成する
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showHistory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            履歴 {history.length > 0 && `(${history.length})`}
          </button>
        </div>

        {/* 履歴表示 */}
        {showHistory ? (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">生成履歴</h2>
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  まだ履歴がありません
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => loadFromHistory(item)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate">
                            {item.url}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.timestamp).toLocaleString('ja-JP')}
                          </p>
                        </div>
                        <span className="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                          {item.pageType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* サンプルURL */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  💡 <strong>初めての方へ:</strong> サンプルURLで試してみましょう
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_URLS.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => setSampleUrl(sample.url)}
                      className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              WebページのURL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                required
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '生成中...' : '生成する'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              ※ 公開されているWebページのURLを入力してください
            </p>
          </div>
        </form>
          </>
        )}

        {/* エラー表示 */}
        {error && !showHistory && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">❌ {error}</p>
          </div>
        )}

        {/* 結果表示 */}
        {result && !showHistory && (
          <div className="space-y-6">
            {/* ページタイプ */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">検出されたページタイプ</h2>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                  {getPageType()}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  {result.confidence && `信頼度: ${Math.round(result.confidence * 100)}%`}
                </span>
              </div>
            </div>

            {/* 生成されたコード */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 className="text-xl font-bold">生成されたJSON-LD</h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={validateWithGoogle}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    🔍 Googleで検証
                  </button>
                  <button
                    onClick={validateWithSchemaOrg}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    ✓ Schema.orgで検証
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    📋 コピー
                  </button>
                </div>
              </div>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{getSchemaString()}</code>
              </pre>
            </div>

            {/* 使い方 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="font-bold mb-3">💡 次のステップ</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>
                  <strong>コードをコピー</strong>して、WebページのHTMLの&lt;head&gt;タグ内に貼り付け
                </li>
                <li>
                  <strong className="text-green-600">検証ツールで確認</strong>
                  <ul className="ml-6 mt-1 space-y-1 text-xs">
                    <li>🔍 <strong>Googleで検証:</strong> リッチリザルト表示を確認（記事や商品ページ向け）</li>
                    <li>✓ <strong>Schema.orgで検証:</strong> 構文エラーを確認（すべてのページ向け）</li>
                  </ul>
                </li>
                <li>
                  エラーがある場合は修正するか、再生成してください
                </li>
              </ol>
              
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>💡 ヒント:</strong> Organizationなど一部のスキーマはリッチリザルトに表示されませんが、
                  検索エンジンの理解向上やナレッジパネル、音声検索に役立つため、<strong>必ず実装することをおすすめします</strong>。
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  <strong>📸 画像について:</strong> OGP画像(og:image)を優先的に抽出します。
                  インラインSVGや不確実なURLは自動的に除外されます。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* トラブルシューティング */}
        {!showHistory && (
          <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="font-bold mb-3 text-lg">⚠️ よくある質問と対処法</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Googleで「アイテムが検出されませんでした」と表示される
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  → <strong>これは正常です!</strong> Organization, WebSite, BreadcrumbListなどのスキーマは
                  リッチリザルト対象外ですが、SEO効果はあります。Schema.orgで検証してエラーがなければOKです。
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  リッチリザルトに表示されないけど意味ある?
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  → <strong>絶対に実装すべきです!</strong> ナレッジパネル、音声検索、AIアシスタント、
                  検索エンジンの理解向上に役立ちます。将来のリッチリザルト対応の可能性もあります。
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  WebSiteスキーマが追加で生成された
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  → <strong>これは正常です!</strong> ECサイトやポータルサイトなど、サイト内検索機能がある場合、
                  Googleの「サイトリンク検索ボックス」表示のためにWebSiteスキーマも自動生成されます。
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  ロゴ画像が含まれていない
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  → OGP画像や確実なロゴURLが見つからなかった場合、404エラーを避けるため自動的に除外されます。
                  必要に応じて手動で追加できます。
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  「必須フィールドが欠けています」エラー
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  → ページに情報が不足している可能性があります。別のURLで試すか、ページに必要な情報を追加してください
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 機能説明 */}
        {!showHistory && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold mb-2">SEO価値重視</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              SNSリンク、連絡先、所在地など、リッチな情報を優先抽出
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-bold mb-2">サイト内検索対応</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ECサイト等では自動でWebSiteスキーマを追加生成
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="font-bold mb-2">SVG対策済み</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              OGP画像を優先、インラインSVGは自動除外
            </p>
          </div>
        </div>
        )}
      </main>

      <footer className="text-center py-8 text-gray-600 dark:text-gray-400 text-sm">
        <p>© 2024 構造化データ自動生成ツール - MVP</p>
      </footer>
    </div>
  );
}