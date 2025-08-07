# インストール方法 / Installation Guide

## 📦 GitHub Releasesからインストール（推奨）

### 日本語

1. **ダウンロード**
   - [Releases](https://github.com/1kaguya/twitch-chat-overlay/releases)ページへアクセス
   - 最新版の `twitch-chat-overlay-vX.X.X.zip` をダウンロード

2. **解凍**
   - ダウンロードしたZIPファイルを任意の場所に解凍
   - 解凍後のフォルダは削除しないでください

3. **Chromeで読み込み**
   - Chromeで `chrome://extensions/` を開く
   - 右上の「デベロッパーモード」をONにする
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - 解凍したフォルダを選択

4. **完了！**
   - Twitchの配信ページにアクセス
   - チャットオーバーレイが自動的に表示されます

### English

1. **Download**
   - Go to [Releases](https://github.com/1kaguya/twitch-chat-overlay/releases) page
   - Download the latest `twitch-chat-overlay-vX.X.X.zip`

2. **Extract**
   - Extract the ZIP file to any location
   - Do not delete the extracted folder

3. **Load in Chrome**
   - Open `chrome://extensions/` in Chrome
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the extracted folder

4. **Done!**
   - Visit any Twitch stream
   - Chat overlay will appear automatically

## 🔧 開発者向け / For Developers

### ソースコードからビルド

```bash
# Clone repository
git clone https://github.com/1kaguya/twitch-chat-overlay.git
cd twitch-chat-overlay

# Load in Chrome
# Follow steps 3-4 above using the cloned folder
```

### 自分でZIPを作成

```bash
# Create ZIP package
zip -r twitch-chat-overlay.zip \
  manifest.json \
  content.js \
  background.js \
  inject-minimal.js \
  cleanup-script.js \
  popup.html \
  popup.js \
  popup.css \
  overlay.css \
  icon*.png
```

## ❓ トラブルシューティング

### オーバーレイが表示されない
- デベロッパーモードが有効か確認
- 拡張機能が有効になっているか確認
- ページをリロード（F5）してみる

### エラーが出る
- 解凍したフォルダが移動・削除されていないか確認
- Chrome拡張機能ページで再読み込みボタンをクリック

## 📝 注意事項

- 解凍したフォルダは削除しないでください
- フォルダを移動した場合は、拡張機能を再度読み込む必要があります
- Chrome Web Store版がリリースされたら、そちらへの移行を推奨します