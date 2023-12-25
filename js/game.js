const MINE = '💣';
const FLAG = '🚩';
const NORMAL = '🥹';
const HAPPY = '😍';
const SAD = '🤧';
const DEAD = '🥵';
const HAPPY_WIN = '🥳';
var gElPlayer = document.querySelector('.player');
// global

var gBoard;

var gGame ={
    isOn: false,
    firstClick: true,
    showCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gLevel = {
    size: 4,
    mines: 2,
    lives: 1,
    bestTime: localStorage.besttimeeasy
};/// Set to ez by default

var gElLives = document.querySelector('.lives');

if(!localStorage.besttimeeasy) localStorage.setItem("besttimeeasy", Infinity);
if(!localStorage.besttimemedium) localStorage.setItem("besttimemedium", Infinity);
if(!localStorage.besttimehard) localStorage.setItem("besttimehard", Infinity);

/// Initialize the game by building the game board
/// rendering, and setting the initial values for game state
function init(){
    gElPlayer.innerText = NORMAL;
    gBoard = buildBoard(gLevel.size);
    renderBoard(gBoard);

    if(gLevel.bestTime === Infinity) return;
    var elBestTimeDisplay = document.querySelector('.best-time');

    if(gLevel.bestTime < 60) elBestTimeDisplay.innerText = `Best time: ${gLevel.bestTime} seconds`
    else if(gLevel.bestTime > 60){
        var bestTimeMins = (gLevel.bestTime / 60).toFixed(2);
        elBestTimeDisplay.innerText = `Best time: ${bestTimeMins} minutes`
    }

    if(gLevel.size === 4) gElLives.innerText = '💟'
    else gElLives.innerText = '💟💟'
}

function handleLevel(level){
    switch(level){
        case 'easy':
            gLevel.size = 4;
            gLevel.mines = 2;
            gLevel.lives = 1;
            gLevel.bestTime = +localStorage.besttimeeasy;
            break;
        case 'medium':
            gLevel.size = 8;
            gLevel.mines = 12;
            gLevel.lives = 3;
            gLevel.bestTime = +localStorage.besttimemedium;
            break;
        case 'hard':
            gLevel.size = 12;
            gLevel.mines = 30;
            gLevel.lives = 3;
            gLevel.bestTime = +localStorage.besttimehard;
            break;
    }
    gameOver();
    restart();
    init();
}

///Create 4x4 board with cell objects
function buildBoard(){
    var board = [];
    for(var i = 0; i < gLevel.size; i++){
        board.push([]);
        for(var j = 0; j < gLevel.size; j++){
            var cell = {
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i].push(cell);
        }
    }
    return board;
}
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

//////// GAME ACTIONS //////////
/// handling cell clicks, revealing numbers or mines
function cellClicked(elCell, i, j){
    var cell = gBoard[i][j];
    if(cell.isMarked) return;

    ///first click of the game
    if(!gGame.isOn && gGame.firstClick){
        placeMines(gLevel.mines, i, j);
        gGame.isOn = true;
        gGame.firstClick = false;
        startClock();
        setMinesNegsCount();
        gElPlayer.innerText = HAPPY;
        ///mine
    }else if(cell.isMine){
        cell.isShown = true;
        if(gLevel.lives > 1){
            gLevel.lives--;
            renderCell(i, j, MINE);
            /// render the updated lives
            if(gLevel.lives === 2) gElLives.innerText = '💟💟';
            else if(gLevel.lives === 1) gElLives.innerText = '💟';
            else gElLives.innerText = SAD;
            return;
        }else if(gLevel.lives === 1){
            renderBombs();
            gameOver('lost');
            return;
        }
    }

    ///rest - as long as game is on and cell is not mine

    if (gGame.isOn){
        /// cell with mines around

        if(cell.minesAroundCount > 0) elCell.innerText = cell.minesAroundCount;

        /// cell with no mines around
        else{
            renderNegs(gBoard, i ,j);
        }

        /// in any case:
        elCell.style = 'background-color: red';
        cell.isShown = true;
        if(isWin()) gameOver('win');
    }
}

function handleFlag(i, j){
    var cell = gBoard[i][j];

    if(!gGame.isOn) return;
    if(cell.isShown && !cell.isMine) return;

    if(!cell.isMarked){
        renderCell(i, j, FLAG);
        cell.isMarked = true;
        if(isWin()) gameOver('win');
    }else {
        if (cell.isMine && cell.isShown) return;
        renderCell(i, j, ' ');
        cell.isMarked = false;
    }
}

///////// game over, win, restart//////////

function gameOver(status){
    stopClock();
    gGame.isOn = false;
    if(status === 'win'){
        gElPlayer.innerText = HAPPY_WIN;
        var currGameTime = gGame.secsPassed;
        if(gLevel.size === 4){
            if(currGameTime < +localStorage.besttimeeasy) localStorage.besttimeeasy = currGameTime;
        }else if(gLevel.size === 8){
            if(currGameTime < +localStorage.besttimemedium) localStorage.besttimemedium = currGameTime;
        }else if(gLevel.size === 12){
            if(currGameTime < +localStorage.besttimehard) localStorage.besttimehard = currGameTime;
        }
    } else if(status === 'lost'){
        gElLives.innerText = '💔';
        gElPlayer.innerText = DEAD;
    }
}

function isWin(){
    for(var i = 0; i < gBoard.length; i++){
        for(var j = 0; j < gBoard[0].length; j++){
            if(gBoard[i][j].isMine && !gBoard[i][j].isMarked) false;
            if(!gBoard[i][j].isMine && !gBoard[i][j].isShown) return false;
        }
    }
    return true;
}

function restart(){

    stopClock();
    gGame.isOn = false;
    gGame.firstClick = true;
    gGame.showCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;

    document.querySelector('.timer').innerHTML = '00:00';
    gStartTime = null;
    gTimeElasped = null;
    document.querySelector('.best-time').innerText = '';
    init();
}

//// guide
function guideToggle(){
    var elGuideBtn = document.querySelector('.guide-btn');
    if(elGuideBtn.innerText === '❌') elGuideBtn.innerText = '❔';
    else elGuideBtn.innerText = '❌';

    var elGuide = document.querySelector('.guide');

    elGuide.classList.toggle('hidden');
}