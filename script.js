// ==========================
// 設定
// ==========================

const symbols = [
    "🍒",
    "🍋",
    "🔔",
    "⭐",
    "7️⃣"
];


const symbolWeights = {
    "🍒": 35,
    "🍋": 30,
    "🔔": 20,
    "⭐": 10,
    "7️⃣": 5
};


const payouts = {
    "🍒": 3,
    "🍋": 5,
    "🔔": 8,
    "⭐": 15,
    "7️⃣": 30
};


// ==========================
// ゲーム状態
// ==========================

let coins = 25;
let bet = 3;
let spinning = false;


// ==========================
// リール取得
// ==========================

const reels = [];

for (let col = 0; col < 5; col++) {

    for (let row = 0; row < 3; row++) {

        const reel = document.getElementById(
            `reel${col + 1}-${row + 1}`
        );

        reels.push(reel);
    }
}


// ==========================
// HTML要素
// ==========================

const coinsDisplay =
    document.getElementById("coins");

const betDisplay =
    document.getElementById("bet");

const betControlValue =
    document.getElementById("betControlValue");

const resultDisplay =
    document.getElementById("result");

const spinButton =
    document.getElementById("spinButton");

const betMinus =
    document.getElementById("betMinus");

const betPlus =
    document.getElementById("betPlus");

const paylineLayer =
    document.getElementById("paylineLayer");


// ==========================
// 表示更新
// ==========================

function updateDisplay() {

    coinsDisplay.textContent = coins;
    betDisplay.textContent = bet;
    betControlValue.textContent = bet;
}


// ==========================
// ランダムシンボル
// ==========================

function randomSymbol() {

    const totalWeight =
        Object.values(symbolWeights)
            .reduce(
                (sum, weight) => sum + weight,
                0
            );

    let random =
        Math.random() * totalWeight;


    for (const symbol of symbols) {

        random -= symbolWeights[symbol];

        if (random <= 0) {
            return symbol;
        }
    }

    return symbols[0];
}


// ==========================
// BET -
// ==========================

betMinus.addEventListener("click", () => {

    if (spinning) return;

    if (bet > 1) {

        bet--;

        updateDisplay();
    }
});


// ==========================
// BET +
// ==========================

betPlus.addEventListener("click", () => {

    if (spinning) return;

    if (bet < coins) {

        bet++;

        updateDisplay();
    }
});


// ==========================
// SPIN
// ==========================

spinButton.addEventListener("click", spin);


function spin() {

    if (spinning) return;


    if (coins < bet) {

        resultDisplay.textContent =
            "コインが足りない！";

        return;
    }


    spinning = true;

    spinButton.disabled = true;


    // BET消費
    coins -= bet;

    updateDisplay();


    resultDisplay.textContent =
        "🎰 SPINNING...";


    // 前回のラインを消す
    clearPaylines();


    // ========================
    // 5列を回す
    // ========================

    for (let col = 0; col < 5; col++) {

        const start = col * 3;
        const end = start + 3;


        // 回転開始
        for (let i = start; i < end; i++) {

            reels[i]
                .classList
                .add("spinning");
        }


        // 回転中
        const interval = setInterval(() => {

            for (
                let i = start;
                i < end;
                i++
            ) {

                reels[i].textContent =
                    randomSymbol();
            }

        }, 70);


        // 左から順番に停止
        setTimeout(() => {

            clearInterval(interval);


            for (
                let i = start;
                i < end;
                i++
            ) {

                reels[i].textContent =
                    randomSymbol();


                reels[i]
                    .classList
                    .remove("spinning");


                reels[i]
                    .classList
                    .add("reelStop");


                setTimeout(() => {

                    reels[i]
                        .classList
                        .remove("reelStop");

                }, 400);
            }

        }, 1200 + col * 500);
    }


    // ========================
    // 全停止
    // ========================

    setTimeout(() => {

        finishSpin();

        spinning = false;

        spinButton.disabled = false;

    }, 1200 + 5 * 500 + 400);
}


// ==========================
// シンボル取得
// ==========================

function getSymbol(col, row) {

    return reels[
        col * 3 + row
    ].textContent;
}


// ==========================
// 当たりラインを探す
// ==========================

function findWinningLines() {

    const winningLines = [];


    // ==================================================
    // ① 横方向
    // ==================================================

    for (let row = 0; row < 3; row++) {

        let col = 0;


        while (col < 5) {

            const symbol =
                getSymbol(col, row);


            let count = 1;


            // 同じシンボルが何個続いているか
            while (
                col + count < 5 &&
                getSymbol(col + count, row) === symbol
            ) {

                count++;
            }


            // 3連以上なら当たり
            if (count >= 3) {

                const positions = [];


                for (
                    let i = 0;
                    i < count;
                    i++
                ) {

                    positions.push([
                        col + i,
                        row
                    ]);
                }


                winningLines.push({

                    type: "horizontal",

                    positions: positions,

                    symbol: symbol,

                    count: count

                });
            }


            // 次のグループへ
            col += count;
        }
    }


    // ==================================================
    // ② 縦方向
    // ==================================================

    for (let col = 0; col < 5; col++) {

        const top =
            getSymbol(col, 0);

        const middle =
            getSymbol(col, 1);

        const bottom =
            getSymbol(col, 2);


        if (
            top === middle &&
            middle === bottom
        ) {

            winningLines.push({

                type: "vertical",

                positions: [
                    [col, 0],
                    [col, 1],
                    [col, 2]
                ],

                symbol: top,

                count: 3

            });
        }
    }


    // ==================================================
    // ③ ↘ 斜め
    // ==================================================

    // 左上 → 右下
    for (let startCol = 0; startCol <= 2; startCol++) {

        const positions = [
            [startCol, 0],
            [startCol + 1, 1],
            [startCol + 2, 2]
        ];


        const a =
            getSymbol(
                positions[0][0],
                positions[0][1]
            );

        const b =
            getSymbol(
                positions[1][0],
                positions[1][1]
            );

        const c =
            getSymbol(
                positions[2][0],
                positions[2][1]
            );


        if (
            a === b &&
            b === c
        ) {

            winningLines.push({

                type: "diagonal",

                positions: positions,

                symbol: a,

                count: 3
            });
        }
    }


    // ==================================================
    // ④ ↗ 斜め
    // ==================================================

    // 左下 → 右上
    for (let startCol = 0; startCol <= 2; startCol++) {

        const positions = [
            [startCol, 2],
            [startCol + 1, 1],
            [startCol + 2, 0]
        ];


        const a =
            getSymbol(
                positions[0][0],
                positions[0][1]
            );

        const b =
            getSymbol(
                positions[1][0],
                positions[1][1]
            );

        const c =
            getSymbol(
                positions[2][0],
                positions[2][1]
            );


        if (
            a === b &&
            b === c
        ) {

            winningLines.push({

                type: "diagonal",

                positions: positions,

                symbol: a,

                count: 3
            });
        }
    }


    return winningLines;
}


// ==========================
// 当たり判定
// ==========================

function finishSpin() {

    clearPaylines();


    // 全当たりラインを取得
    const winningLines =
        findWinningLines();


    let totalWin = 0;


    // ========================
    // 全ラインを処理
    // ========================

    for (const line of winningLines) {

        const win =
            calculateWin(
                line.symbol,
                line.count
            );


        totalWin += win;


        // ラインを表示
        drawPayline(
            line.positions
        );
    }


    // ========================
    // 当たり
    // ========================

    if (totalWin > 0) {

        coins += totalWin;

        updateDisplay();


        resultDisplay.textContent =
            `🎉 ${winningLines.length}ライン当たり！ +${totalWin} COINS 🎉`;


        // コインジャンプ
        coinJump();

    } else {

        updateDisplay();


        resultDisplay.textContent =
            "😢 はずれ！もう一回！";
    }


    // ========================
    // GAME OVER
    // ========================

    if (coins <= 0) {

        resultDisplay.textContent =
            "GAME OVER 😭";
    }
}


// ==========================
// 配当計算
// ==========================

function calculateWin(symbol, count) {

    let multiplier = 1;


    if (count === 4) {

        multiplier = 2;
    }


    if (count >= 5) {

        multiplier = 4;
    }


    return (
        bet *
        payouts[symbol] *
        multiplier
    );
}


// ==========================
// コインジャンプ
// ==========================

function coinJump() {

    coinsDisplay
        .classList
        .remove("coinJump");


    // アニメーションを再スタート
    void coinsDisplay.offsetWidth;


    coinsDisplay
        .classList
        .add("coinJump");


    setTimeout(() => {

        coinsDisplay
            .classList
            .remove("coinJump");

    }, 700);
}


// ==========================
// 当たりライン描画
// ==========================

function drawPayline(positions) {

    if (!paylineLayer) return;


    const slot =
        document.querySelector(
            ".slotMachine"
        );


    const slotRect =
        slot.getBoundingClientRect();


    const points = [];


    // ========================
    // 各マスの中心を取得
    // ========================

    for (const [col, row] of positions) {

        const reel =
            reels[
                col * 3 + row
            ];


        const rect =
            reel.getBoundingClientRect();


        const x =
            rect.left +
            rect.width / 2 -
            slotRect.left;


        const y =
            rect.top +
            rect.height / 2 -
            slotRect.top;


        points.push({
            x: x,
            y: y
        });
    }


    // ========================
    // SVG polyline
    // ========================

    const svgNS =
        "http://www.w3.org/2000/svg";


    const line =
        document.createElementNS(
            svgNS,
            "polyline"
        );


    const pointString =
        points
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(" ");


    line.setAttribute(
        "points",
        pointString
    );


    line.classList.add(
        "payline"
    );


    paylineLayer.appendChild(line);


    // ========================
    // 線の長さ
    // ========================

    let length = 0;


    for (
        let i = 1;
        i < points.length;
        i++
    ) {

        const dx =
            points[i].x -
            points[i - 1].x;


        const dy =
            points[i].y -
            points[i - 1].y;


        length +=
            Math.sqrt(
                dx * dx +
                dy * dy
            );
    }


    line.style.setProperty(
        "--lineLength",
        `${length}px`
    );


    line.style.strokeDasharray =
        `${length} ${length}`;


    line.style.strokeDashoffset =
        length;


    // ========================
    // 削除
    // ========================

    setTimeout(() => {

        line.remove();

    }, 1500);
}


// ==========================
// ラインを消す
// ==========================

function clearPaylines() {

    if (!paylineLayer) return;

    paylineLayer.innerHTML = "";
}


// ==========================
// 初期化
// ==========================

updateDisplay();