# ⚡ クイックスタート（5分で始める）

## 🎯 最速で動かす手順

### 1️⃣ APIキー取得（1分）

https://aistudio.google.com/app/apikey
→ 「Create API Key」→ コピー

### 2️⃣ インストール（2分）

```bash
cd schema-generator-mvp
npm install
```

### 3️⃣ 環境変数設定（30秒）

```bash
# .env.localを作成
echo "GEMINI_API_KEY=あなたのAPIキー" > .env.local
```

### 4️⃣ 起動（30秒）

```bash
npm run dev
```

→ http://localhost:3000 を開く

### 5️⃣ テスト（1分）

1. URLを入力: `https://www.example.com`
2. 「生成する」をクリック
3. 完成! 🎉

## 🚀 すぐにデプロイ

```bash
# Vercelにデプロイ
npx vercel

# 環境変数を設定
npx vercel env add GEMINI_API_KEY

# 本番デプロイ
npx vercel --prod
```

完了! 🎊

## 📝 最初のテストURL例

日本語サイトで試してみてください:

- ブログ記事: `https://zenn.dev/任意の記事`
- 商品ページ: `https://www.amazon.co.jp/任意の商品`
- 企業サイト: `https://www.任意の企業.co.jp`

## 💡 Tips

- 生成には5-15秒かかります
- 初回は少し遅いことがあります
- エラーが出たら、URLが公開されているか確認

## 🎉 うまくいったら

次は以下をカスタマイズ:

1. `src/app/page.tsx` - デザイン変更
2. `src/app/api/generate/route.ts` - AI処理の調整
3. Vercelにデプロイして公開

がんばってください! 🚀
