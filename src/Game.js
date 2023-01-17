import React, { memo, useState, useEffect, useCallback, useRef } from 'react'
import { Box, Grid, Stack, Button, LinearProgress } from "@mui/material"
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const COUNTMAX = 30; // 制限時間(短くしていく場合どこかで管理)
const HEROHPMAX = 30; // ヒーローHP

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
    typography: {
        fontFamily: ["メイリオ", "Meiryo", "游ゴシック", "YuGothic", "Roboto", "sans-serif"].join(','),
        fontSize: 16,
        button: {
            textTransform: "none",
        },
    },
    components: {
        MuiButton: {
            textTransform: "none",
            defaultProps: {
                variant: "contained",
            },
        },
    },
});

class CardData {
    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.attack = props.attack;
        this.health = props.health;
    }
}

function Counter(props) {
    // おおもとのpaddingとかはもうちょっとていねいに？
    // 1=8px
    return (
        <Box sx={{
            float: "left",
            padding: 1,
            width: "100%",
            maxWidth: "280px",
        }}>
            <Box sx={{ float: "left", marginRight: 1 }}>
                残り時間: {
                    props.count === -1
                        ? <span>---</span>
                        : <Box
                            component="span"
                            sx={{ marginLeft: props.count < 10 ? "1rem" : ".5rem" }}
                        >
                            {props.count}
                        </Box>
                }
            </Box>
            <Box sx={{ float: "right" }}>
                <Box sx={{ float: "left" }}>スコア: </Box>
                <Box sx={{ float: "left", width: "3rem", textAlign: "right" }}>{props.score}</Box>
            </Box >
            <br />
            <LinearProgress
                sx={{ width: "100%", marginTop: 1 }}
                variant="determinate"
                value={(props.count / props.countMax) * 100} />
        </Box>
    );
}

function Card(props) {
    const shadowBlue = "drop-shadow(2px 0 1px #0ce4f7) drop-shadow(-2px 0 1px #0ce4f7) drop-shadow(0 2px 1px #0ce4f7) drop-shadow(0 -2px 1px #0ce4f7)";
    const shadowRed = "drop-shadow(2px 0 1px #ff0000) drop-shadow(-2px 0 1px #ff0000) drop-shadow(0 2px 1px #ff0000) drop-shadow(0 -2px 1px #ff0000)";

    const WidthBox = styled(Box)(() => ({
        position: "absolute",
        width: "30%",
        bottom: "5%",
    }));

    const HeightBox = styled(Box)(() => ({
        position: "relative",
        height: "0",
        paddingTop: "100%",
        borderRadius: "50%",
    }));

    const StatsNumBox = styled(Box)(() => ({
        width: "100%",
        height: "100%",
        // paddingを相殺
        position: "absolute",
        top: "0",
        // フォントサイズをいい感じに
        fontSize: "clamp(1px, 5vw, 100px)",
        lineHeight: "clamp(1px, 10vw, 100px)",
        fontWeight: "bold",
        textAlign: "center",
        userSelect: "none",
    }));

    return (
        <Grid item
            xs={4} sx={{ position: "relative", overflow: "hidden", aspectRatio: "4/5.7" }} >
            <Box onClick={props.onClick}>
                <Box
                    component="img"
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter:
                            (props.card.health === 0
                                ? "grayscale(100%)"
                                : ("grayscale(0%) " + (props.selected ? shadowRed : shadowBlue))
                            ),
                        "&:hover": props.card.health === 0 ? {} : {
                            filter: shadowRed,
                        }
                    }}
                    onLoad={props.onLoad}
                    src={`https://art.hearthstonejson.com/v1/render/latest/jaJP/256x/${props.card.id}.png`}
                    alt="" />
                <WidthBox sx={{ left: "8%" }}>
                    <HeightBox sx={{ background: "rgb(255, 207, 65)" }}>
                        <StatsNumBox>
                            {props.card.attack}
                        </StatsNumBox>
                    </HeightBox>
                </WidthBox>
                <WidthBox sx={{ right: "8%" }}>
                    <HeightBox sx={{ background: "rgb(255, 70, 70)" }}>
                        <StatsNumBox>
                            {props.card.attack}
                        </StatsNumBox>
                    </HeightBox>
                </WidthBox>
            </Box>
        </Grid>
    );
}

function Hero(props) {
    // ヒロパつくる？ 1点　2回復
    const heroId = "HERO_09" // いっぱいあってもいいかもー
    return (
        <Grid item
            xs={4} sx={{ position: "relative", overflow: "hidden", aspectRatio: "4/5.7" }}>
            <Box
                component="img"
                src={`https://art.hearthstonejson.com/v1/render/latest/enUS/512x/${heroId}.png`} // propsから持ってくるとか
                alt=""
                sx={{
                    // objectFit: "cover",
                    width: "200%",
                    position: "relative",
                    top: "-25%",
                    left: "-50%",
                    filter: (props.heroHp > 0 ? "grayscale(0%)" : "grayscale(100%)"),
                }} />
            <Box sx={{
                position: "absolute",
                right: "0",
                bottom: "0",
                width: "45%",
                // maxWidth: "50px",
            }}>
                <Box sx={{
                    position: "relative",
                    height: "0",
                    paddingTop: "100%",
                    borderRadius: "50%",
                    background: "rgb(180, 180, 180)",
                }}>
                    <Box sx={{
                        width: "100%",
                        height: "100%",
                        // paddingを相殺
                        position: "absolute",
                        top: "0",
                        // フォントサイズをいい感じに
                        fontSize: "clamp(1px, 8vw, 100px)",
                        lineHeight: "clamp(1px, 15vw, 100px)",
                        fontWeight: "bold",
                        textAlign: "center",
                        userSelect: "none",
                    }}>
                        {props.heroHp}
                    </Box>
                </Box>
            </Box>
        </Grid >
        // </div > 
    );
}

// ここをメモ化することで、毎秒再描画されることを回避
const Board = memo((props) => {
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
            /* <div className={'board' + (props.imgLoaded < 8 ? ' loading' : "")}>{[
                    renderCard(0), renderCard(1), renderCard(2),
                    renderCard(3), renderHero(), renderCard(4),
                    renderCard(5), renderCard(6), renderCard(7),
                ]}</div> */
            /* .board {
                width: 90vw;
                min-width: 400px;
                max-width: 600px;
                height: 75vh;
                max-height: 800px;
                margin: 10px;
            } */
            <Grid container
                display={props.imgLoaded < 8 ? "none" : "flex"}
            // spacing={1}
            >
                {renderCard(0)}
                {renderCard(1)}
                {renderCard(2)}
                {renderCard(3)}
                {renderHero()}
                {renderCard(4)}
                {renderCard(5)}
                {renderCard(6)}
                {renderCard(7)}
            </Grid >
        );
        // この時点の高さは合っているが、子の高さを合わせていない
    } else {
        return null;
    }
});

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
            stopCount();
            const result = resultCheck();
            if (result) setMessage("タイムオーバー！ダメージを受けた");
        }
    }, [count, stopCount, resultCheck]);

    // カードがクリックされた時
    const handleCardClick = useCallback((selectAfter) => {
        if (gameReady) {
            return; // ゲーム終了後なら何もしない
        } else {
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
        }
    }, [gameReady, selectBefore, cardList, resultCheck])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {/* <div className="game"> */}
            {/* <div className="top"> */}
            {/* <Box sx={{ display: "flex", margin: 2, }}> */}
            <Stack spacing={2} sx={{ margin: 2 }}>
                <Box>
                    <Button
                        sx={{
                            float: "left",
                            width: "160px",
                            height: "48px",
                            marginRight: "8px"
                        }}
                        onClick={() => handleStartButtonClick(jsonData)}
                        disabled={!gameReady}
                    >
                        {startButtonText}
                    </Button>
                    <Counter
                        count={count}
                        score={score}
                        countMax={COUNTMAX} />
                </Box>
                <Box component="span">{message}</Box>
                {cardList.length
                    ? <Board
                        cardList={cardList}
                        heroHp={heroHp}
                        selectBefore={selectBefore}
                        imgLoaded={imgLoaded}
                        onLoad={handleImgLoad}
                        // 引数を設定するのはBoard側なので、ここではいらない
                        onClick={handleCardClick} />
                    : null}
            </Stack>
            {/* </div> */}
        </ThemeProvider >
    );
}

export default Game