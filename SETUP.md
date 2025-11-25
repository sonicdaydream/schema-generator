# 🚀 セットアップガイド

## 📋 前提条件

- Node.js 18以上
- npm または yarn
- Gemini API Key

## 🔧 ステップ1: Gemini APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. APIキーをコピー

## 💻 ステップ2: プロジェクトのセットアップ

### 1. 依存関係をインストール

```bash
cd schema-generator-mvp
npm install
```

### 2. 環境変数を設定

`.env.local`ファイルを作成:

```bash
cp .env.local.example .env.local
```

`.env.local`を開いて、APIキーを貼り付け:

```
GEMINI_API_KEY=あなたのAPIキーをここに貼り付け
```

### 3. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開く

## 🎨 動作確認

1. URLを入力（例: `https://example.com`）
2. 「生成する」ボタンをクリック
3. 数秒で構造化データが生成される
4. 「コピー」ボタンでクリップボードにコピー

## 🚢 ステップ3: Vercelにデプロイ

### 方法1: Vercel CLIを使用

```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel

# 本番環境にデプロイ
vercel --prod
```

### 方法2: GitHubと連携

1. GitHubリポジトリを作成
2. コードをプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/schema-generator-mvp.git
git push -u origin main
```

3. [Vercel](https://vercel.com)にアクセス
4. 「Import Project」をクリック
5. GitHubリポジトリを選択
6. 環境変数を設定:
   - Key: `GEMINI_API_KEY`
   - Value: あなたのGemini APIキー
7. 「Deploy」をクリック

## 🔑 環境変数の設定（Vercel）

Vercelダッシュボード → Settings → Environment Variables

```
GEMINI_API_KEY = your_actual_api_key
```

すべての環境（Production, Preview, Development）にチェック

## ⚙️ トラブルシューティング

### エラー: "GEMINI_API_KEY is not defined"

→ `.env.local`ファイルが正しく設定されているか確認
→ 開発サーバーを再起動

### エラー: "ページの取得に失敗しました"

→ 入力したURLが正しいか確認
→ そのURLが公開されているか確認
→ CORSエラーの可能性（一部のサイトはアクセス制限あり）

### 生成が遅い

→ Gemini APIの無料枠には制限があります
→ 複雑なページは処理に時間がかかる場合があります

## 📊 コスト

### 開発段階

- Vercel: 無料（Hobby Plan）
- Gemini API: 無料枠あり
  - 15 RPM (Requests Per Minute)
  - 1,500 RPD (Requests Per Day)
  - 1,500,000 TPM (Tokens Per Month)

### 本番環境（想定）

- 月間1000リクエスト: 約¥200-500
- 月間5000リクエスト: 約¥1,000-2,000

## 🎯 次のステップ

1. ✅ MVPの動作確認
2. 🔄 複数のSchemaタイプ対応
3. 📊 使用量分析の追加
4. 💰 課金機能の実装
5. 🌐 サイト全体クロール機能

## 💬 サポート

質問や問題があれば、GitHubのIssueを作成してください。

Happy Coding! 🎉
