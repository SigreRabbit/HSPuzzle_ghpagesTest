import React, { useState, useEffect, useCallback, useRef } from 'react'
import ReactDOM from 'react-dom/client';
import './index.css';

const COUNTMAX = 30; // 制限時間(短くしていく場合どこかで管理)
const HEROHPMAX = 30; // ヒーローHP

class CardData {
    constructor(props) {
        this.id = props.id;
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
            className={'card-container' + (props.card.health !== 0 ? " alive" : "")}
            // onClick={props.card.health !== 0 ? props.onClick : () => { return false; }} // 条件判定がここであるべきかは微妙(Game側とかでもできるため)
            onClick={props.onClick}
        >
            <img
                className={
                    "card"
                    + (props.card.health !== 0 ? " alive" : "")
                    + (props.selected ? " selected" : "")
                }
                onLoad={props.onLoad}
                src={`https://art.hearthstonejson.com/v1/render/latest/jaJP/256x/${props.card.id}.png`}
                alt=""
            />
            <div className="card-stats-width card-attack-width">
                <div className="card-stats-height card-attack-height">
                    <div className="card-stats card-attack">
                        {props.card.attack}
                    </div>
                </div>
            </div>
            <div className="card-stats-width card-health-width">
                <div className="card-stats-height card-health-height">
                    <div className="card-stats card-health">
                        {props.card.health}
                    </div>
                </div>
            </div>
        </div >
    );
}

function Hero(props) {
    // ヒロパつくる？ 1点　2回復
    const heroId = "HERO_09" // いっぱいあってもいいかもー
    return (
        <div className={"hero-container" + (props.heroHp > 0 ? " alive" : "")}>
            <img
                className="hero"
                src={`https://art.hearthstonejson.com/v1/render/latest/enUS/512x/${heroId}.png`} // propsから持ってくるとか
                alt=""
            />
            <div className='hero-hp-width'>
                <div className='hero-hp-height'>
                    <div className="hero-hp">
                        {props.heroHp}
                    </div>
                </div>
            </div>
        </div >
    );
}

function Board(props) {
    // スタートボタンが押されないとcardListが空なため
    if (props.cardList && props.cardList.length) {
        function renderCard(i) {
            return (
                <Card
                    key={i}
                    card={props.cardList[i]}
                    selected={i === props.selectBefore || false}
                    onClick={() => props.onClick(i)} // ここで引数を与える
                    onLoad={() => props.onLoad(i)} // 引数は未使用だが、いちおう
                />
            );
        }
        function renderHero() {
            return (
                <Hero key="hero" heroHp={props.heroHp} />
            )
        }
        return (
            <div>
                <div className={'board' + (props.imgLoaded < 8 ? ' loading' : "")}>{[
                    renderCard(0), renderCard(1), renderCard(2),
                    renderCard(3), renderHero(), renderCard(4),
                    renderCard(5), renderCard(6), renderCard(7),
                ]}</div>
            </div>
        );
    } else {
        return null;
    }
}

function Game(props) {
    const [jsonData, setJsonData] = useState([])
    const [gameReady, setGameReady] = useState(false);

    const [startButtonText, setStartButtonText] = useState("loading...")
    const [message, setMessage] = useState("※ロードが終わらない場合はページを再読込");

    const [imgLoaded, setImgLoaded] = useState(0);

    const [round, setRound] = useState(1);
    const [heroHp, setHeroHp] = useState(0);

    const [score, setScore] = useState(0);
    const [count, setCount] = useState(-1); // 0のときuseEffectなので初期値-1

    const [cardList, setCardList] = useState([]);
    const [selectBefore, setSelectBefore] = useState(-1); // -1は何も選択されていない状態

    // jsonリクエスト
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
        // レスポンスイメージ(折りたたみ)
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

    // 読込完了次第gameReady
    useEffect(() => {
        if (jsonData.length) {
            setGameReady(true);
            setStartButtonText("ゲームスタート！")
            setMessage("　")
        }
    }, [jsonData]);

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
        // 状態管理
        setGameReady(false);

        // ロード処理
        setImgLoaded(0);
        setMessage("loading...");

        // heroHpが0以下ならいろいろ初期化
        if (heroHp <= 0) {
            setHeroHp(HEROHPMAX);
            setRound(1);
            setScore(0)
        }

        setStartButtonText(`Round ${round}`);
        setCount(COUNTMAX);

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
    }, [round, heroHp]);

    // カードがロードされた時
    // これをuseCallbackにしないと、再レンダリングがかかる
    const handleImgLoad = useCallback((i) => {
        // ここで全部ロード終わった判定を入れることも考えたけど、
        // stateを取るタイミングが同時だとうまくいかなかったので、
        // ここの処理をインクリメントにして、useEffectで判定してみる
        setImgLoaded(imgLoaded => imgLoaded + 1);
    }, []);
    // 全部ロードされたら表示してタイマースタート
    useEffect(() => {
        if (imgLoaded === 8) {
            setMessage("　") // 表示合わせに全角スペース
            startCount(); //タイマースタート
        }
    }, [imgLoaded, startCount]);

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
            const remainHeroHp = heroHp - damage
            setHeroHp(remainHeroHp);

            // ダメージ計算の結果死んでいたら、ゲームオーバー処理後falseを返す
            if (remainHeroHp <= 0) {
                setMessage("ゲームオーバー！");
                setStartButtonText("もう一度プレイ");
                return false;
            }
        }
        // ダメージ計算で生きているか、引数がfalseなら、次ラウンド処理後trueを返す
        setRound(round => round + 1);
        setStartButtonText("次のラウンド")
        return true;
    }, [stopCount, cardList, heroHp]);

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
        if (cardList[selectAfter].health <= 0) { // healthが0以下のものを選択
            return false;

        } else if (selectBefore === -1) { // 未選択から選択
            setSelectBefore(selectAfter)

        } else if (selectAfter === selectBefore) { // 同じものを2回選択
            setSelectBefore(-1);

        } else {
            let cards = [...cardList];
            // こうしないと参照先を変更してしまってレンダリングがおかしくなる可能性あり
            // https://nekoniki.com/20200818_react_state_array

            // バトル！
            const aHealth = cards[selectAfter].health;
            const bHealth = cards[selectBefore].health;
            const aAttack = cards[selectAfter].attack;
            const bAttack = cards[selectBefore].attack;

            const aHealthSub = aHealth - bAttack;
            if (aHealthSub > 0) cards[selectAfter].health = aHealthSub;
            else {
                setScore(score => score + 1);
                cards[selectAfter].health = 0;
            }

            const bHealthSub = bHealth - aAttack;
            if (bHealthSub > 0) cards[selectBefore].health = bHealthSub;
            else {
                setScore(score => score + 1);
                cards[selectBefore].health = 0;
            }

            setCardList(cards);
            setSelectBefore(-1);

            // 終了判定
            // クリア
            const allDeadFlag = cardList.every((card) => { return (card.health === 0 || card.attack === 0); });
            if (allDeadFlag) {
                resultCheck(false); // 常にtrueが返る
                setMessage("クリア！");
                return;
            }
            // 詰み
            const onlyAliveFlag = cardList.filter((card) => { return card.health !== 0; }).length === 1;
            if (onlyAliveFlag) {
                const result = resultCheck();
                if (result) setMessage("詰んだ！ダメージを受けた");
                return;
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
            <div className='message'>
                {message}
            </div>
            {cardList.length
                ? <Board
                    cardList={cardList}
                    heroHp={heroHp}
                    selectBefore={selectBefore}
                    imgLoaded={imgLoaded}
                    onLoad={handleImgLoad}
                    onClick={handleCardClick} // 引数を設定するのはBoard側なので、ここではいらない
                />
                : null}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);