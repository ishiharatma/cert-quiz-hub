# cert-quiz-hub — Claude 作業指示

## プロジェクト概要

資格試験ごとの学習ガイドと練習問題（クイズアプリ）をまとめた静的サイト（Jekyll）。
GitHub Pages で公開。試験フォルダ単位で完結する構成。

## ディレクトリ構成

```
cert-quiz-hub/
├── index.html                          # サイトトップ（試験一覧）
├── assets/js/notifications.js          # 共通お知らせモジュール
├── _includes/gtag.html                 # Google Analytics インクルード
├── _config.yml                         # Jekyll 設定
└── exams/
    └── <exam-id>/                      # 試験フォルダ（試験ごとに作成）
        ├── index.html                  # 試験トップ（必須）
        ├── quiz.html                   # クイズアプリ（必須）
        ├── quiz-data.json              # 問題データ（必須）
        ├── study-guide.md              # 学習ガイド（Jekyll→HTML変換）
        ├── announcements.json          # お知らせデータ（必須）
        ├── qr-code.svg                 # このページのQRコード
        └── qr-code-quiz.svg            # quiz.html のQRコード
```

## スキル（スラッシュコマンド）

| コマンド | 説明 |
|---|---|
| `/create-exam` | 新試験フォルダを一式作成する |
| `/generate-questions` | 問題を生成してレビューまで通す |
| `/review-questions` | 既存問題を品質レビューする |

## 新試験を追加するときの流れ

1. `/create-exam` を実行 → フォルダ・ファイルを自動生成
2. `study-guide.md` の内容を確認・編集
3. `/generate-questions` を実行 → 問題生成＋自動レビュー
4. 問題を確認して問題があれば `/review-questions` で再レビュー
5. `index.html`（ルート）に試験カードが追加済みであることを確認
6. `announcements.json` を更新してお知らせを設定

## quiz-data.json の基本ルール

- 全問題は `.claude/templates/quiz-data-schema.md` のスキーマに従う
- **選択肢の文量を均等に揃えること**（正解だけ長い/短いは禁止）
- `correct_answer_index` は問題セット全体で 0〜3 が均等に分布すること
- 誤答はもっともらしい内容にする（明らかに間違いとわかるものは不可）

## ファイル編集時の注意

- `index.html` と `quiz.html` は Jekyll front matter（`---`）が必要
- `{% include gtag.html %}` を `<head>` 内に必ず含める
- お知らせ機能は `../../assets/js/notifications.js` を読み込み、
  `CertQuizNotifications.init('announcements.json', document.querySelector('.header-nav'))` で初期化
