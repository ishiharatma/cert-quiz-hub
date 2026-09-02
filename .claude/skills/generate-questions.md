---
name: generate-questions
description: 試験問題を生成してレビューまで通す。question-generator と question-reviewer サブエージェントを並列・直列に組み合わせてオーケストレーションする。
---

# /generate-questions — 問題生成ワークフロー

## 使い方

```
/generate-questions
```

引数なしで実行すると対話形式で確認を取りながら進む。

---

## Step 0: パラメータ確認

ユーザーに以下を確認する（まだ指定されていない場合）：

1. **exam_id** — 試験フォルダ名（例: `sacloud-ai-certification`）
2. **category** — 生成するカテゴリ（`quiz-data.json` の `category` フィールド値、または "all" で全カテゴリ）
3. **count** — 生成する問題数（デフォルト: 10）

`exams/<exam_id>/` が存在しない場合は中止して `/create-exam` を先に実行するよう案内する。

---

## Step 1: 事前情報収集

以下を並行して読み込む：

- `exams/<exam_id>/quiz-data.json` — 既存問題数・分布を把握
- `exams/<exam_id>/study-guide.md` — 試験範囲の確認
- `.claude/templates/quiz-data-schema.md` — スキーマルールの再確認

既存問題数と `correct_answer_index` の分布（0〜3 の各件数）をユーザーに報告する。

---

## Step 2: カテゴリ分割と並列生成

`count` が 5 以上かつ複数カテゴリにまたがる場合、カテゴリ単位で分割して
**`question-generator` サブエージェントを並列起動** する。

```
例: count=20、カテゴリ=3つ の場合
  → Agent(question-generator, category=A, count=7, start_number=101)
  → Agent(question-generator, category=B, count=7, start_number=108)
  → Agent(question-generator, category=C, count=6, start_number=115)
  （3つを同時並列実行）
```

単一カテゴリまたは count < 5 の場合は直列で1つの `question-generator` を起動する。

各エージェントへの指示に以下を含める：
- `exam_id`, `category`, `count`, `start_number`
- `.claude/templates/quiz-data-schema.md` を必ず読むこと
- 既存の `correct_answer_index` 分布情報（生成時に分布が均等になるよう調整させる）

---

## Step 3: 生成結果の統合

並列実行した場合は全エージェントの出力を結合する。
結合後の問題リストに対して以下を確認：

- `question_number` の連番・重複なし
- `correct_answer_index` の全体分布（0〜3 が均等か）

問題があれば手動で修正してから次のステップへ進む。

---

## Step 4: 品質レビュー（question-reviewer）

統合した問題リストを `question-reviewer` サブエージェントに渡してレビューする。

`question-reviewer` へ渡す情報：
- 生成した問題の JSON（全件）
- `exam_id`（study-guide 参照のため）

`question-reviewer` の出力（レビュー結果）をユーザーに提示する。

---

## Step 5: NG 問題の修正

レビュー結果に NG がある場合：

1. NG 件数と内容をユーザーに報告する
2. **自動修正できる NG**（F2/F3/F5）は自動で修正する
3. **判断が必要な NG**（B4 など）は改善案を提示してユーザーの確認を取る
4. Warning は改善案とともに「修正しますか？」と確認する

---

## Step 6: quiz-data.json への書き込み

ユーザーが承認したら `exams/<exam_id>/quiz-data.json` に追記する。

書き込み手順：
1. 既存の `quiz-data.json` を読み込む
2. 生成した問題を配列末尾に追加する
3. JSON として整形して書き出す（インデントは2スペース）

書き込み後：
- 最終的な問題数をユーザーに報告する
- `correct_answer_index` の最終分布を表で報告する
- `announcements.json` の更新が必要か確認する

---

## エラーハンドリング

| 状況 | 対応 |
|---|---|
| `study-guide.md` が存在しない | 警告を出して続行するが、事実確認ができない旨を明示 |
| 生成問題数が `count` に満たない | 不足分を報告してユーザーに追加生成の意思を確認 |
| NG が全問題の30%超 | `question-generator` を再起動して再生成を提案 |
