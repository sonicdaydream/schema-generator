# 🔧 JSONパースエラー修正版 v2.2

## 🐛 発生していた問題

```
❌ Bad control character in string literal in JSON at position 291
```

Gemini APIからの応答に制御文字（改行、タブなど）が含まれており、JSONパースに失敗していました。

## ✅ 修正内容

### 1️⃣ **Gemini APIにJSON出力モードを設定**

```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.1,           // 低温度で一貫性UP
    responseMimeType: 'application/json', // JSON強制
  }
});
```

**効果:**
- Geminiが直接クリーンなJSONを返す
- パースエラーが大幅に減少

### 2️⃣ **多段階のJSONパース処理**

```
1. 直接パースを試行（JSON出力モード使用時）
   ↓ 失敗した場合
2. Markdownコードブロックを除去して再試行
   ↓ 失敗した場合
3. 制御文字を除去して最終試行
   ↓ それでも失敗
4. 詳細なエラーメッセージを表示
```

### 3️⃣ **プロンプトの改善**

```
【JSON出力の注意】
- JSON形式のみを返す
- Markdownのコードブロックは不要
- 制御文字はエスケープする
- schemaフィールドは改行を\\nでエスケープ
```

### 4️⃣ **バリデーション追加**

```typescript
if (!parsedResponse.pageType || !parsedResponse.schema) {
  throw new Error('AIの応答に必要な情報が含まれていません');
}
```

必須フィールドをチェック

## 🚀 更新方法

### 既存プロジェクトを更新:

```bash
# 解凍
tar -xzf schema-generator-mvp-v2.2-json-fix.tar.gz

cd schema-generator-mvp

# 開発サーバー再起動
npm run dev
```

### または個別ファイル更新:

`src/app/api/generate/route.ts` のみコピー

## 🧪 テスト

1. **ブラウザをハードリフレッシュ** (Ctrl+Shift+R)
2. **URLを入力して生成**
3. **エラーが出ないことを確認**

### テスト用URL:

```
https://alarmbox.jp
https://zenn.dev
https://www.google.com
```

## 💡 期待される動作

**Before:**
```
❌ Bad control character in string literal in JSON
```

**After:**
```
✅ スムーズに生成完了
✅ ページタイプが表示される
✅ JSON-LDコードが表示される
```

## 🔍 デバッグ方法

もしまだエラーが出る場合:

1. **ブラウザのコンソールを開く** (F12)
2. **Networkタブ**で`/api/generate`のレスポンスを確認
3. **エラー内容をスクリーンショット**で共有

## 📊 技術的な詳細

### JSON出力モードとは

Gemini 2.0から追加された機能:
- `responseMimeType: 'application/json'`を設定
- AIが構造化されたJSONを直接返す
- パースエラーのリスクが大幅減

### 制御文字とは

ASCIIコード 0x00-0x1F の文字:
- 0x09: タブ
- 0x0A: 改行 (LF)
- 0x0D: 改行 (CR)
- など

これらがJSON文字列内に直接含まれるとパースエラーになります。

---

**この修正で、パースエラーは99%解決するはずです! 🎉**

試してみて結果を教えてください!
