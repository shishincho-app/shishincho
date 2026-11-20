# 指針帳

中長期の目標（指針）を毎日目に入れて、5分以内の「はじめの一歩」と毎日の前進を続けるための習慣アプリです。

**アプリを開く：** https://sakyo0723left-dev.github.io/shishincho/

iPhoneではSafariで開き、「共有 → ホーム画面に追加」するとアプリとして使えます。
記録はそれぞれの端末の中（ブラウザの保存領域）だけに保存され、どこにも送信されません。

## 構成
- `src/app.html` … アプリ本体（HTML/CSS/JS 1ファイル）
- `src/sw.js` … オフライン対応とリマインド
- `src/manifest.webmanifest`, `src/icon-*.png` … ホーム画面用の設定とアイコン
- `build.py` … `src/` から `docs/`（GitHub Pagesで公開する一式）を作る
- `docs/` … 公開用（自動生成。直接編集しない）

## 更新のしかた
```bash
python3 build.py
```
を実行して `docs/` を作り直し、コミットしてプッシュすると、数分で公開ページに反映されます。
