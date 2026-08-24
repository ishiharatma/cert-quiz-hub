# cert-quiz-hub

資格試験ごとの学習ガイド（Markdown）と練習問題（クイズアプリ）をまとめた学習リポジトリです。
GitHub Pages で配信し、試験ごとにフォルダを分けて資料・練習問題へ遷移できるようにしています。

## 構成

```text
.
├── index.html                              # トップページ（試験一覧）
├── qr-code.svg                             # トップページ共有用QRコード
├── exams/
│   └── sacloud-ai-certification/
│       ├── index.html                      # 試験ページ（資料・練習問題への導線）
│       ├── qr-code.svg                     # 試験ページ共有用QRコード
│       ├── study-guide.md                  # 学習ガイド（Jekyllが自動でHTML化）
│       ├── quiz.html                       # 練習問題（自己完結型HTML、ビルド不要）
│       ├── qr-code-quiz.svg                # 練習問題ページ共有用QRコード
│       └── quiz-data.json                  # 練習問題の元データ（quiz.htmlに埋め込み済み）
└── _config.yml                             # GitHub Pages(Jekyll)設定
```

各ページのヘッダーにGitHub/PortfolioリンクとQRコード共有ボタンがあります。
QRコードは `https://ishiharatma.github.io/cert-quiz-hub/` 配下の各ページURLを事前にエンコードしたSVGです
（試験フォルダを追加する際は、そのページ用のQRコードも作成してください）。

## 試験を追加する手順

1. `exams/<試験スラッグ>/` フォルダを作成する（例: `exams/aws-saa/`）。
2. `study-guide.md`（先頭にYAML front matterを追加）、`quiz.html`、`index.html` を配置する。
   既存の `exams/sacloud-ai-certification/` を雛形としてコピーして書き換えるのが早い。
3. ルートの `index.html` にある試験カードを追加・差し替える。

## GitHub Pages

`main` への push をトリガーに、GitHub Actions（`.github/workflows/deploy-pages.yml`）が
Jekyll ビルド（`jekyll-theme-cayman`）→ GitHub Pages へのデプロイを行う構成です。
「Deploy from a branch」（`/docs` や `gh-pages` ブランチ配信）は使用しません。

- Markdown（`study-guide.md`）は Jekyll により自動でHTML化される
- `index.html` / `quiz.html` は front matter を持たない素のHTMLとしてそのまま配信される

### 初回セットアップ（リポジトリ作成後、1回だけ）

GitHub上のリポジトリ設定 → **Settings → Pages → Build and deployment → Source** で
**「GitHub Actions」を選択**してください（デフォルトの「Deploy from a branch」のままだと
このワークフローは使われません）。設定後は `main` に push するたびに自動デプロイされます。

## License

[MIT](LICENSE)
