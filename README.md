### ローカルで動かす
```
npm start
```
-> http://localhost:3000

### gh-pagesを更新
```
npm run deploy
```

### mainにpush
```
git add .
git commit
git push
```


### メモ

- よさそう
-- Divine Shield -> 1回ダメージ無効にしてDSを消す　相手攻撃力0にするのが処理楽か？ちゃんと戻すこと  
-- Lifesteal     -> ダメージ与えたら攻撃分回復(要バランス調整)(ディバシへの処理)  
-- Poisonous     -> ダメージ与えたら相手HP0  
-- Reborn        -> 死んだらHP1に戻してスコア+1してRebornを消す  
-- Stealth       -> 2枚目として選択されない(攻撃対象にならない)　選ぼうとしたらメッセージを出さないと意味不明かも  
-- Taunt         -> ある場合、2枚目としてTauntしか選択できない　1枚目として選べてよいかどうか(あまり意味なくなるため)  

- あんまよくない  
-- Rush/Charge   -> 最初に攻撃しなければならない？  
-- Windfury      -> 2回分ダメージ？微妙  
