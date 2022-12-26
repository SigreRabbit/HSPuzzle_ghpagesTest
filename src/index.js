import React, { useState, useEffect, useCallback, useRef } from 'react'
import ReactDOM from 'react-dom/client';
import './index.css';

const COUNTMAX = 30;
const HPMAX = 30;

class CardData {
    constructor(props) {
        this.name = props.name;
        this.attack = props.attack;
        this.health = props.health;
    }
}

function StartButton(props) {
    return (
        <button className="button start" onClick={props.onClick} disabled={!props.gameReady}>
            {props.text}
        </button >
    );
}

function Counter(props) {
    return (
        <div className="counter">
            <div className='time'>残り時間: {
                props.count === -1
                    ? <span>---</span>
                    : props.count < 10
                        ? <span className='time-space'>{props.count}</span>
                        : <span>{props.count}</span>
            }</div>
            <div className='score'>スコア: {props.score}</div>
            <br />
            <progress id="progress-bar" max={props.countMax} value={props.count} />
        </div >
    );
}

function Card(props) {
    return (
        <div
            className={
                "card"
                + (props.card.health !== 0 ? " alive" : "")
                + (props.selected ? " selected" : "")
            }
            onClick={props.card.health !== 0 ? props.onClick : function () { return false; }}
        >
            {props.card.name} < br />
            {props.card.attack} / {props.card.health}
        </div >
    );
}

function Hero(props) {
    // ヒロパ？ 1点　2回復
    return (
        <div className="hero">
            {props.hp}
        </div >
    );
}

function Board(props) {
    if (props.cardList && props.cardList.length) {
        function renderCard(i) {
            return (
                <Card
                    key={i}
                    card={props.cardList[i]}
                    selected={i === props.selectBefore || false}
                    onClick={() => props.onClick(i)}
                />
            );
        }

        function renderHero() {
            return (
                <Hero key="hero" hp={props.hp} />
            )
        }

        return (
            <div className='board'>
                {[
                    renderCard(0),
                    renderCard(1),
                    renderCard(2),

                    renderCard(3),
                    renderHero(),
                    renderCard(4),

                    renderCard(5),
                    renderCard(6),
                    renderCard(7),
                ]}
            </div>
        );
    } else { return null; }
}

function Game(props) {
    // jsonリクエスト
    const [jsonData, setJsonData] = useState([])
    useEffect(() => {
        const url = 'https://api.hearthstonejson.com/v1/latest/jaJP/cards.collectible.json';
        const fetchJsonData = async () => {
            try {
                const res = await fetch(url);
                const json = await res.json();
                setJsonData(json)
            } catch (e) {
                console.log("error", e);
            }
        }
        fetchJsonData(); //呼び出し
        // レスポンスイメージ
        // [{
        //     artist: "Konstantin Turovec",
        //     attack: 1,
        //     cardClass: "DRUID",
        //     collectible: true,
        //     cost: 3,
        //     dbfId: 43025,
        //     flavor: "こいつこそが例のカブト虫の楽団の、幻の5番目のメンバーなんだ！",
        //     health: 6,
        //     id: "ICC_808",
        //     mechanics: (2)['TAUNT', 'TRIGGER_VISUAL'],
        //     name: "クリプトロード",
        //     race: "UNDEAD",
        //     rarity: "COMMON",
        //     set: "ICECROWN",
        //     text: "<b>挑発</b>\n自分がミニオンを\n召喚した後\n　体力+1を獲得する。",
        //     type: "MINION",
        // }]
    }, []); // ロード時1回だけ

    const [gameReady, setGameReady] = useState(false);
    const [count, setCount] = useState(-1); // 0のときuseEffectなので初期値-1
    // 並べ替えてない
    const [startButtonText, setStartButtonText] = useState("ゲームスタート！")
    const [round, setRound] = useState(1);
    const [cardList, setCardList] = useState([]);
    const [hp, setHp] = useState(0);
    const [message, setMessage] = useState("　"); // 表示合わせに全角スペース
    const [selectBefore, setSelectBefore] = useState(-1); // -1は何も選択されていない状態
    const [score, setScore] = useState(0);

    // 読込完了次第gameReady
    useEffect(() => { if (jsonData.length) setGameReady(true); }, [jsonData]);

    // タイマ
    // https://rios-studio.com/tech/react-hookにおけるtimeoutとtimeinterval【止まらない・重複する】
    const intervalRef = useRef(null);
    const startCount = useCallback(() => {
        if (intervalRef.current !== null) return;
        intervalRef.current = setInterval(() => {
            setCount(c => c - 1);
        }, 1000);
    }, []);
    const stopCount = useCallback(() => {
        if (intervalRef.current === null) return;
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setCount(-1);
    }, []);

    // スタートボタンが押された時
    const handleStartButtonClick = useCallback((jsonData) => {
        setGameReady(false);
        setMessage("");

        setStartButtonText(`Round ${round}`);
        if (hp <= 0) setHp(HPMAX);

        // カードリスト抽選
        let randCardList = [];
        let rand, card;
        for (let i = 0; i < 8; i++) {
            do {
                rand = Math.floor(Math.random() * jsonData.length)
                card = jsonData[rand]
            } while (card.type !== "MINION");
            randCardList.push(new CardData(card));
        }
        setCardList(randCardList);

        //カウントダウン開始
        setCount(COUNTMAX);
        startCount();
    }, [round, hp, startCount]);

    // 終了条件を満たしたときの結果チェック処理
    // 全部クリア、1枚残り、タイムオーバーで呼ばれる
    const resultCheck = useCallback((checkDamageFlag = true) => {
        // 終了処理
        stopCount();
        setGameReady(true);

        if (checkDamageFlag) {
            // ダメージ計算
            const damage = cardList
                .filter((card) => { return card.health !== 0; })
                .reduce((sum, card) => sum + card.attack, 0);
            const remainHp = hp - damage
            setHp(remainHp);

            // ダメージ計算の結果死んでいたら、ゲームオーバー処理後falseを返す
            if (remainHp <= 0) {
                setMessage("ゲームオーバー！");
                setRound(1);
                setStartButtonText("もう一度プレイ");
                return false;
            }
        }
        // ダメージ計算で生きているか、引数がfalseなら、次ラウンド処理後trueを返す
        setRound(round => round + 1);
        setStartButtonText("次のラウンド")
        return true;
    }, [stopCount, cardList, hp]);

    // タイムオーバー処理
    // countが変化するたびに呼ばれて、0になった瞬間に処理される
    useEffect(() => {
        if (count === 0) {
            const result = resultCheck();
            if (result) setMessage("タイムオーバー！ダメージを受けた");
        }
    }, [count, resultCheck]);

    // カードがクリックされた時
    const handleCardClick = useCallback((selectAfter) => {
        if (selectBefore === -1) setSelectBefore(selectAfter); // 1枚目
        else if (selectAfter === selectBefore) setSelectBefore(-1); // 同じの
        else {
            let changedCardList = cardList;

            const aHealth = changedCardList[selectAfter].health;
            const bHealth = changedCardList[selectBefore].health;
            const aAttack = changedCardList[selectAfter].attack;
            const bAttack = changedCardList[selectBefore].attack;

            const aHealthSub = aHealth - bAttack;
            if (aHealthSub > 0) changedCardList[selectAfter].health = aHealthSub;
            else {
                setScore(score => score + 1);
                changedCardList[selectAfter].health = 0;
            }

            const bHealthSub = bHealth - aAttack;
            if (bHealthSub > 0) changedCardList[selectBefore].health = bHealthSub;
            else {
                setScore(score => score + 1);
                changedCardList[selectBefore].health = 0;
            }

            setCardList(changedCardList);
            setSelectBefore(-1);

            const allDeadFlag = cardList.every((card) => { return card.health === 0 || card.attack === 0; });
            if (allDeadFlag) {
                resultCheck(false); // 常にtrueが返る
                setMessage("クリア！");
            }

            const onlyAliveFlag = cardList.filter((card) => { return card.health !== 0; }).length === 1;
            if (onlyAliveFlag) {
                const result = resultCheck();
                if (result) setMessage("詰んだ！ダメージを受けた");
            }
        }
    }, [selectBefore, cardList, resultCheck])

    return (
        <div className="game">
            <div className="top">
                <StartButton
                    gameReady={gameReady}
                    text={startButtonText}
                    onClick={() => handleStartButtonClick(jsonData)}
                />
                <Counter count={count} score={score} countMax={COUNTMAX} />
            </div>
            <div className='message'>{message}</div>
            <Board
                cardList={cardList}
                hp={hp}
                selectBefore={selectBefore}
                onClick={(i) => handleCardClick(i)} />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);