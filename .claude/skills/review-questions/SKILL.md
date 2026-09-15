---
name: review-questions
description: 既存の quiz-data.json を品質レビューして問題一覧と改善案を報告する。
---

# /review-questions — 問題品質レビュー

## 使い方

```
/review-questions
/review-questions <exam-id>
/review-questions <exam-id> <question_number または範囲 例:1-20>
```

---

## Step 0: パラメータ確認

引数が省略された場合はユーザーに確認：

1. **exam_id** — 試験フォルダ名（省略時は存在する試験の一覧を表示）
2. **range** — レビュー対象問題（省略時は全問題）

---

## Step 1: `question-reviewer` を起動

`question-reviewer` サブエージェントを起動して以下を渡す：

- `exam_id`
- レビュー対象の問題 JSON（range 指定があれば絞り込んだもの）
- `.claude/templates/quiz-data-schema.md` を参照すること

---

## Step 2: レビュー結果の表示

`question-reviewer` の出力をそのままユーザーに提示する。

---

## Step 3: 修正の実施（ユーザー確認後）

ユーザーが「修正する」と回答した場合：

1. NG 問題の修正案を再度提示する
2. 承認を得た問題を `quiz-data.json` に反映する
3. 修正件数・変更内容をサマリーとして報告する

ユーザーが「修正しない」または特定の問題だけ修正を選んだ場合はその指示に従う。

---

## 単発チェックコマンド（簡易版）

「今すぐ1問だけ確認したい」場合、問題のJSONをユーザーが貼り付けると
スキーマルールに照らして即座に評価できる。
この場合は `question-reviewer` を起動せず、インラインで評価して報告する。
