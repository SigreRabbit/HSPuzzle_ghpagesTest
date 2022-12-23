import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client';
import './index.css';

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
            ゲームスタート！
        </button >
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
    return (
        <div className="hero">
            {props.hp}
        </div >
    );
}

function Board(props) {
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
}

function Game(props) {
    const [gameReady, setGameReady] = useState(false);
    const [round, setRound] = useState(1);
    const [cardList, setCardList] = useState([]);
    const [hp, setHp] = useState(30);
    const [message, setMessage] = useState("");
    const [selectBefore, setSelectBefore] = useState(-1);

    // 読込完了したらgameReady
    useEffect(() => {
        if (props.jsonData.length) setGameReady(true);
    }, [props.jsonData]);

    // スタートボタンが押された時
    function handleStartButtonClick(jsonData) {
        setGameReady(false);

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
        setHp(30);
        setMessage(`Round ${round}`);

        //カウントダウン的な
    }

    // カードがクリックされた時
    function handleCardClick(selectAfter) {
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
            else changedCardList[selectAfter].health = 0;

            const bHealthSub = bHealth - aAttack;
            if (bHealthSub > 0) changedCardList[selectBefore].health = bHealthSub;
            else changedCardList[selectBefore].health = 0;

            setCardList(changedCardList);
            setSelectBefore(-1);
        }

        // 成功失敗判定
        const allDeadFlag = cardList.every((card) => {
            return card.health === 0 || card.attack === 0;
        });
        if (allDeadFlag) {
            setGameReady(true);
            setRound(round + 1);
            setMessage("クリア！");
        }

        const onlyAliveFlag = cardList.filter((card) => { return card.health !== 0; }).length === 1;
        if (onlyAliveFlag) {
            setGameReady(true);
            setRound(round + 1);
            setMessage("詰んだ！ダメージを受けた");
        }
    }

    const board = cardList && cardList.length
        ? <Board
            cardList={cardList}
            hp={hp}
            selectBefore={selectBefore}
            onClick={(i) => handleCardClick(i)}
        />
        : null;

    return (
        <div className="game">
            <StartButton
                gameReady={gameReady}
                onClick={() => handleStartButtonClick(props.jsonData)}
            />
            <div className='message'>{message}</div>
            {board}
        </div>
    );

}

const FetchJsonData = () => {
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
    }, []);

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

    return (<Game jsonData={jsonData} />);
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<FetchJsonData />);