---
name: create-exam
description: 新しい試験フォルダと必要なファイル一式を作成し、ルートの index.html に試験カードを追加する。
---

# /create-exam — 新試験作成

## 使い方

```
/create-exam
/create-exam <exam-id> "<試験名>"
```

---

## Step 0: パラメータ確認

引数が省略された場合はユーザーに以下を確認する：

1. **exam-id** — フォルダ名に使う英数字・ハイフン（例: `aws-saa-c03`）
2. **試験名** — 日本語での正式名（例: `AWS SAA-C03`）
3. **主催者・ブランド名** — カードに表示するバッジ名（例: `Amazon Web Services`）
4. **説明文** — 試験トップカードの説明（例: `ソリューションアーキテクト アソシエイトの想定問題集です。`）
5. **アクセントカラー** — CSS の16進カラー（デフォルト: `#3949ab`）
6. **シラバスの大カテゴリ一覧** — カンマ区切り（例: `設計,移行,コスト最適化`）

`exams/<exam-id>/` が既に存在する場合は中止して警告する。

---

## Step 1: フォルダ・ファイル作成

以下の順でファイルを作成する。

### 1-A: `exams/<exam-id>/announcements.json`

`.claude/templates/announcements.json` をコピーして今日の日付でサンプルを入れる。

```json
{
  "maxDisplay": 5,
  "expiryDays": 30,
  "notices": [
    {
      "date": "<今日の日付 yyyy/mm/dd>",
      "content": "<試験名> の問題集を公開しました。"
    }
  ]
}
```

### 1-B: `exams/<exam-id>/quiz-data.json`

空の配列でファイルを作成する：

```json
[]
```

### 1-C: `exams/<exam-id>/index.html`

`exams/sacloud-ai-certification/index.html` を参考に、以下を差し替えた新ファイルを作成する：

| 差し替え箇所 | 内容 |
|---|---|
| `<title>` | `<試験名> ｜ cert-quiz-hub` |
| `--accent` / `--accent-dark` | 指定カラー |
| `<h1>` | 試験名 |
| `<p>`（サブタイトル） | `学習ガイド ｜ 想定問題集（練習問題）` |
| QR URL 表示テキスト | `ishiharatma.github.io/cert-quiz-hub/exams/<exam-id>` |
| `../..` の相対パス | 正しいパスに統一 |
| footer copyright | `<試験名>` を含む形に変更 |

**お知らせ機能の追加（必須）:**
```html
<script src="../../assets/js/notifications.js"></script>
```
と
```js
CertQuizNotifications.init('announcements.json', document.querySelector('.header-nav'));
```
を既存スクリプトの IIFE 内に追加する。

### 1-D: `exams/<exam-id>/study-guide.md`

以下のテンプレートで作成する：

```markdown
---
---
# <試験名> 学習ガイド

> このガイドは学習用の非公式資料です。必ず公式情報も参照してください。

## シラバス概要

| カテゴリ | 出題比率の目安 |
|---|---|
| <カテゴリ1> | 〜% |

## <カテゴリ1>

### <サブカテゴリ>

（内容をここに記入）
```

---

## Step 2: ルート index.html に試験カードを追加

`index.html` の `<!-- 今後追加予定の試験 -->` コメントの直前に以下を挿入する：

```html
<a class="exam-card <css-class>" href="exams/<exam-id>/index.html">
  <span class="badge"><主催者名></span>
  <h3><試験名></h3>
  <p><説明文></p>
</a>
```

`<css-class>` は新しいカラーに合わせて `.exam-card` に追加する CSS クラスを決め、
対応するスタイルをルート `index.html` の `<style>` ブロックに追記する：

```css
.exam-card.<css-class> .badge { background: <tint色>; color: <dark色>; }
```

---

## Step 3: 確認・報告

作成したファイル一覧をユーザーに報告する：

```
✅ 作成完了

exams/<exam-id>/
  ├── index.html
  ├── quiz-data.json  （空）
  ├── study-guide.md  （テンプレート）
  └── announcements.json

index.html に試験カードを追加しました。

次のステップ:
  1. study-guide.md に試験範囲の内容を記入する
  2. /generate-questions でカテゴリごとに問題を生成する
  3. QRコードを生成してフォルダに配置する（qr-code.svg, qr-code-quiz.svg）
```

---

## 注意事項

- `quiz.html` は作成しない（別途、既存の `quiz.html` を参考に手動または別スキルで作成）
- QRコード SVG は外部ツールで生成が必要なため、このスキルでは作成しない
- `study-guide.html` は Jekyll が `study-guide.md` を自動変換するため不要
