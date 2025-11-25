# 構造化データ自動生成ツール MVP

URLを入力するだけで、最適な構造化データ(JSON-LD)を自動生成するツール

## 機能
- URLから自動でページタイプを判定
- Schema.org準拠のJSON-LD生成
- Gemini APIによる高精度解析
- コピペで使えるコード出力

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.local`ファイルを作成:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. 開発サーバー起動
```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開く

## デプロイ

### Vercelにデプロイ
```bash
vercel
```

環境変数 `GEMINI_API_KEY` をVercelのダッシュボードで設定

## 使い方

1. URLを入力
2. 「生成する」ボタンをクリック
3. 自動生成されたJSON-LDをコピー
4. サイトの`<head>`タグ内に貼り付け

## 技術スタック
- Next.js 14
- TypeScript
- Gemini API
- Tailwind CSS
