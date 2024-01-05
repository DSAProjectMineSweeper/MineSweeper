
const game = new Game();
const feature = new Features();
const soundManager = new SoundManager();
const timer = new Timer();
const renderer = new Renderer();

const MINE = '💣';
const FLAG = '🚩';
const NORMAL = '🥹';
const HAPPY = '😍';
const SAD = '🤧';
const DEAD = '🥵';
const HAPPY_WIN = '🥳';

var gElLives = document.querySelector('.lives');
var gElPlayer = document.querySelector('.player');
var gElBestTimeDisplay = document.querySelector('.best-time');

function init(){
    game.init();
}

function handleLevel(levelSize) {
    switch (levelSize) {
        case 4:
            game.gLevel.size = 4;
            game.gLevel.mines = 2;
            game.gLevel.lives = 1;
            game.gLevel.hints = 1;
            game.gLevel.safeClicks = 1;
            game.gLevel.bestTime = +localStorage.besttimeeasy;
            break;
        case 8:
            game.gLevel.size = 8;
            game.gLevel.mines = 12;
            game.gLevel.lives = 3;
            game.gLevel.hints = 3;
            game.gLevel.safeClicks = 2;
            game.gLevel.bestTime = +localStorage.besttimemedium;
            break;
        case 12:
            game.gLevel.size = 12;
            game.gLevel.mines = 30;
            game.gLevel.lives = 3;
            game.gLevel.hints = 3;
            game.gLevel.safeClicks = 3;
            game.gLevel.bestTime = +localStorage.besttimehard;
            break;
    }
    game.gameOver();
    game.restart();
    game.init();
}

function cellClicked(elCell, i, j ){
    game.cellClicked(elCell, i, j);
}

function handleFlag(i, j){
    game.handleFlag(i, j);
}

function restart(){
    game.restart();
}

function undo(){
    feature.undo();
}

function sneakPeekOn(){
    feature.sneakPeekOn();
}

function showSafeCell(){
    feature.showSafeCell();
}

function handleAudio(){
    renderer.handleAudio();
}