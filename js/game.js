const MINE = '💣';
const FLAG = '🚩';
const NORMAL = '🥹';
const HAPPY = '😍';
const SAD = '🤧';
const DEAD = '🥵';
const HAPPY_WIN = '🥳';
var gElPlayer = document.querySelector('.player'); /// global as used several times in different functions

var winSound = new Audio('audio/win.wav');
var loseSound = new Audio('audio/lose.wav');
var bombSound = new Audio('audio/bomb.mp3');

var gBoard;

var gGame = {
    isOn: false, firstClick: true,
    shownCount: 0, markedCount: 0, secsPassed: 0
}

var gLevel = { size: 4, mines: 2, lives: 1, bestTime: +localStorage.besttimeeasy, safeClicks: 1 }; /// SET TO EASY BY DEFULT
var gElLives = document.querySelector('.lives');
var gMoves = [];
//// note about everything related to localStorage: it works, but my code is probably a bit messy / repetitive
//// as i haven't got to practice it's use yet

if (!localStorage.besttimeeasy) localStorage.setItem("besttimeeasy", Infinity);
if (!localStorage.besttimemedium) localStorage.setItem("besttimemedium", Infinity);
if (!localStorage.besttimehard) localStorage.setItem("besttimehard", Infinity);


///////////////  game starting functions 

function init() {
    gElPlayer.innerText = NORMAL;
    gBoard = buildBoard(gLevel.size);
    renderBoard(gBoard);

    gElLives.innerText = (gLevel.size === 4) ? '💟' : '💟💟💟';
    document.querySelector('.sneak-peek').innerText = (gLevel.size === 4) ? '💡' : '💡💡💡';
    document.querySelector('.safe-click').innerText = (gLevel.size === 4) ? `🧐` : (gLevel.size === 8) ? '🧐🧐' : '🧐🧐🧐'

    updateBestTime();
}

function handleLevel(level) {
    switch (level) {
        case 'easy':
            gLevel.size = 4;
            gLevel.mines = 2;
            gLevel.lives = 1;
            gLevel.hints  = 1;
            gLevel.safeClicks = 1;
            gLevel.bestTime = +localStorage.besttimeeasy;
            break;
        case 'medium':
            gLevel.size = 8;
            gLevel.mines = 12;
            gLevel.lives = 3;
            gLevel.hints = 3;
            gLevel.safeClicks = 2;
            gLevel.bestTime = +localStorage.besttimemedium;
            break;
        case 'hard':
            gLevel.size = 12;
            gLevel.mines = 30;
            gLevel.lives = 3;
            gLevel.hints = 3;
            gLevel.safeClicks = 3;
            gLevel.bestTime = +localStorage.besttimehard;
            break;
    }
    gameOver();
    restart();
    init();
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false,
                iPos: i,
                jPos: j
            }
            board[i].push(cell);
        }
    }
    return board;
}

/////////////// mines related functions

function placeMines(num, iExclude, jExclude) {
    var mineCount = 0;
    while (mineCount < num) {
        var i = getRandomInt(0, gBoard.length);
        var j = getRandomInt(0, gBoard[0].length);

        if (gBoard[i][j].isMine) continue;
        if (i === iExclude && j === jExclude) continue;

        gBoard[i][j].isMine = true;
        mineCount++;
    }
}

function countMines(mat, rowIdx, colIdx) {
    var count = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            var currCell = mat[i][j];
            if (currCell.isMine) count++;
        }
    }
    return count;
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) continue;
            var minesCount = countMines(gBoard, i, j);
            if (minesCount === 0) minesCount = '';
            gBoard[i][j].minesAroundCount = minesCount;
        }
    }
}

/////////////// game actions such as clicks 

function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j];
    if (cell.isMarked) return;

    ///first click of the game- places mines and sets game on
    if (!gGame.isOn && gGame.firstClick) {
        placeMines(gLevel.mines, i, j);
        gGame.isOn = true;
        gGame.firstClick = false;
        startClock();
        setMinesNegsCount();
        gElPlayer.innerText = HAPPY;
    }
    /// sneak peek
    else if (gSneakPeekOn) {
        showSneakPeek(i, j);
        return;
    }
    /// mine
    else if (cell.isMine) {
        bombSound.play();
        cell.isShown = true;
        /// in case life left
        if (gLevel.lives > 1) {
            gLevel.lives--;
            gMoves.push(cell);
            renderCell(i, j, MINE);
            ///render the updated lives
            if (gLevel.lives === 2) gElLives.innerText = '💟💟💔';
            else if (gLevel.lives === 1) gElLives.innerText = '💟💔💔';
            gElPlayer.innerText = SAD;
            return;
        }
        /// in case no lives left
        else if (gLevel.lives === 1) {
            renderBombs();
            gameOver('lost');
            return;
        }
    }

    /// rest- as long as game is on and cell is not mine
    if (gGame.isOn) {
        if (cell.minesAroundCount > 0) {
            elCell.innerText = cell.minesAroundCount;
            gMoves.push(cell);
        }
        else {
            renderNegs(gBoard, i, j)
            gMoves.push(gNrMoves.slice());
            gMoves[gMoves.length - 1].push(cell);
            gNrMoves = [];
        };

        /// in any case other than sneakpeek/mine:
        elCell.classList.add('pressed');
        cell.isShown = true;
        if (isWin()) gameOver('win');
    }
}


function handleFlag(i, j) {
    var cell = gBoard[i][j];

    if (!gGame.isOn) return;
    if (cell.isShown && !cell.isMine) return;

    if (!cell.isMarked) {
        renderCell(i, j, FLAG);
        cell.isMarked = true;
        if (isWin()) gameOver('win');
    } else {
        if (cell.isMine && cell.isShown) return;
        renderCell(i, j, ' ');
        cell.isMarked = false;
    }
}

/////////////// game over, win, restart

function gameOver(status) {
    stopClock();
    gGame.isOn = false;

    if (status === 'win') {
        gElPlayer.innerText = HAPPY_WIN;
        checkBestTime(gLevel.size);
        updateBestTime();
        winSound.play();
    } else if (status === 'lost') {
        gElLives.innerText = (gLevel.size === 4) ? '💔' : '💔💔💔';
        gElPlayer.innerText = DEAD;
        loseSound.play();
    }
}

function isWin() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) return false;
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) return false;
        }
    }
    return true;
}


function restart() {
    stopClock();
    gGame.isOn = false;
    gGame.firstClick = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    document.querySelector('.timer').innerHTML = '00:00';
    gStartTime = null;
    gTimeElasped = null;
    gLevel.hints = (gLevel.size === 4) ? 1 : 3;
    gLevel.safeClicks = (gLevel.size === 4) ? 1 : (gLevel.size === 8) ? 2 : 3;
    gMoves = [];
    gNrMoves = [];
    document.querySelector('.best-time').innerText = '';
    init();
}


///// guide 
function guideToggle() {
    var elGuideBtn = document.querySelector('.guide-btn');
    if (elGuideBtn.innerText === '❌') elGuideBtn.innerText = '❔';
    else elGuideBtn.innerText = '❌';
    var elGuide = document.querySelector('.guide');
    elGuide.classList.toggle('hidden');
}