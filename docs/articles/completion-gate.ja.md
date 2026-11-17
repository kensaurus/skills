# AIエージェントの「完了しました」を信用しない仕組みを作った

> Zenn と note に載せる記事の原稿です。英語版は [completion-gate.md](completion-gate.md)。

AIコーディングエージェントに作業を頼むと、「完了しました」と返ってきたのにテストが落ちていることがあります。チェックリストが半分残ったまま止まることもあります。

これを仕組みで止める「完了ゲート」を作りました。自作のスキル集 [kensaurus/skills](https://github.com/kensaurus/skills) に入っています。MIT ライセンスで、Claude Code と Cursor で動きます。

![完了ゲートの3つの部品。状態ファイル、Stop フック、判定役。未完了が残っていれば作業に戻る。](https://raw.githubusercontent.com/kensaurus/skills/main/docs/screenshots/gate-diagram-ja.png)

## 何が問題か

エージェントは、自分で「終わった」と判断したところで止まります。根拠は差分がコンパイルできたこと、くらいです。

プロンプトに「最後までやり切ること」と書いても確実には効きません。Anthropic の Claude Fable 5.2 向けプロンプトガイドにも、低めの effort では作業を残したままターンを終えやすい、と書かれています。

文章で頼むのをやめて、止まる瞬間を外から検査することにしました。

## 部品は3つ

### 1. 状態ファイル

`complete-everything` スキルは、最初にチェックリストをファイルへ書き出します。場所は `.cursor/complete-everything-state.md` です。

```markdown
- [x] 招待リンクの発行APIを実装
- [x] 失敗するテストを先に書く
- [ ] 期限切れリンクのエラー表示
- [ ] 最後の編集のあとに型チェック・lint・テストを再実行
- [-] ビルド — n/a: このリポジトリにビルド手順がない
```

会話が長くなって文脈が圧縮されても、ファイルは残ります。`[-]`(対象外)には理由が必要です。理由のない `[-]` は未完了として数えます。

### 2. Stop フック

Claude Code と Cursor には、エージェントが止まろうとしたときに動く Stop フックがあります。そこへ Node スクリプトを1本登録します。スクリプトは状態ファイルを読み、未チェックの項目があれば差し戻します。

下は実際の出力です(2026-11-17 に実行)。`agent` の行だけは説明用に足しました。

![状態ファイルに未完了が2つ残った状態でエージェントが完了を宣言する。Stop フックが decision: block を返し、残り2項目を示す。両方チェックすると {} を返し、停止を許可する。](https://raw.githubusercontent.com/kensaurus/skills/main/docs/screenshots/capture-gate.gif)

差し戻しが無限に続かないよう、条件を4つ入れています。

- 1項目も閉じないまま3回差し戻したら諦める
- 「誰々の承認待ち」と書かれた項目は数えない
- 24時間更新のない状態ファイルは無視する
- 状態ファイルがなければ何もしない

4つ目があるので、普段の会話には影響しません。

### 3. 判定役

チェックが全部ついても、まだ完了にしません。`completion-judge` というサブエージェントが、新しいコンテキストで次の4つを照合します。

- 元の依頼
- 状態ファイル
- 差分の全体
- 最後の編集のあとに取り直した検証結果

返すのは `PASS`、`CONTINUE`、`BLOCKED` のどれかです。根拠のない「たぶん通ります」は `CONTINUE` になります。

## 実際に差し戻された例

このスキル集の v2.8.0 を出すとき、リリース用ブランチを判定役にかけました。CI は全部通っていました。結果は `CONTINUE` で、直す点が6つ返ってきました。

1つ紹介します。新しく入れた `/kenji` コマンドに `effort: low` を指定していました。Claude Code では、スキルの effort 指定は同じターンの残りにも効きます。そのため `/kenji` から呼ばれた実装用スキルまで低い effort で動く状態でした。テストでは見つからない不具合です。

6つとも直してからマージしました。経緯は [PR #54](https://github.com/kensaurus/skills/pull/54) にあります。

## スキル名を覚えなくていい

スキルは162個あります。「どれを使えばいいか覚えられない」という声があったので、`/kenji` を追加しました。

```
/kenji ログイン画面が一部のユーザーで壊れている
```

やりたいことを自分の言葉で書くと、合うスキルを1つ選んで実行します。候補が2つあるときだけ、質問を1つします。何も書かずに `/kenji` だけ打つと、メニューが出ます。

![/kenji とだけ入力すると、やりたいこととスキル名の対応表が表示される。](https://raw.githubusercontent.com/kensaurus/skills/main/docs/screenshots/capture-kenji.gif)

## トークンの消費について

増えます。量は選べます。

エージェントは毎回、インストール済みスキルの説明文を1行ずつ読み込みます。全部入れると約39,000文字です。本文は、そのスキルが動くときだけ読み込まれます。

減らすにはプロファイルを指定します。`core` は31個で、説明文は約7,200文字です。

![npx @kensaurus/skills --list-profiles の出力。core、web、backend、mobile、growth、maintain、all の7つ。](https://raw.githubusercontent.com/kensaurus/skills/main/docs/screenshots/capture-profiles.gif)

スキルが増えると、エージェントが似たスキルを取り違えやすくなるという研究もあります([Song & Wei, 2026](https://openreview.net/forum?id=RQuOPsCKnc))。202個のライブラリで成功率が最大21%下がった、という結果です。

## インストール

Node.js 18 以上が必要です。

```bash
npx @kensaurus/skills --auto --dry-run   # 書き込まれるファイルを先に確認
npx @kensaurus/skills --auto             # 見つかったエージェントすべてに導入
npx @kensaurus/skills --auto --verify    # 導入したファイルをハッシュで照合
```

インストーラは Node スクリプト1本です。依存パッケージはなく、ネットワーク接続もしません。書き込み先はホームディレクトリの下だけです。自分で作ったスキルは消しません。

## まだできていないこと

- **効果を示す数字がありません。** 正しいスキルが呼ばれるかを確かめる評価ケースを12個用意しましたが、実行したのは1個です。
- **スキルは私の使い方に寄っています。** React、Next.js、Supabase の案件で書いたものが中心です。
- **ゲートが働くのは Claude Code と Cursor だけです。** Codex CLI と Gemini CLI ではスキルは使えますが、Stop フックがありません。

## 同じものを自分で作るには

読むファイルは2つです。

- [hooks/completion-gate.mjs](https://github.com/kensaurus/skills/blob/main/hooks/completion-gate.mjs): Stop フックの本体
- [agents/completion-judge.md](https://github.com/kensaurus/skills/blob/main/agents/completion-judge.md): 判定役の定義

合わなかった点は [Issue](https://github.com/kensaurus/skills/issues) で教えてください。
