var gNrMoves = [];

function handleAudio() {
    var elAudioControl = document.querySelector('.audio-control');
    if (gGame.isSoundOn) {
        gGame.isSoundOn = false;
        elAudioControl.innerText = '🔇 muted'
    }
    else {
        gGame.isSoundOn = true;
        elAudioControl.innerText = '🔊 sound on'
    }
}

/////////////// renders 

function renderBoard(board) {
    var strHTML = '';

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var className = `cell cell${i}-${j}`
            strHTML += `<td class="${className}" onclick="cellClicked(this, ${i}, ${j})" 
            oncontextmenu="handleFlag(${i}, ${j}); return false;"> </td>`;
        }
    }
    strHTML += '</tr>';
    document.querySelector('.game-board table').innerHTML = strHTML;
}

function renderCell(i, j, value) {
    var elCell = document.querySelector(`.cell${i}-${j}`);
    elCell.innerHTML = value;
}

function renderBombs() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) renderCell(i, j, MINE);
        }
    }
}

function renderNegs(mat, rowIdx, colIdx, degree) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;

            var currNr = mat[i][j];
            if (currNr.isMarked || currNr.isShown) continue;
            gNrMoves.push(currNr);

            renderCell(i, j, currNr.minesAroundCount);
            currNr.isShown = true;
            document.querySelector(`.cell${i}-${j}`).classList.add('pressed');
            if (degree === 1) return;
            if (!currNr.minesAroundCount) renderNegs(mat, i, j);
        }
    }
}

//// needed for the showSneakPeek() function's loop.
function removeClass(i, j, cls) {
    var elCell = document.querySelector(`.cell${i}-${j}`);
    elCell.classList.remove(cls);
}


/////////////// timer related functions

var gStartTime;
var gTimeElasped;
var gTimeInterval;
var gElBestTimeDisplay = document.querySelector('.best-time');

function startClock() {
    var elTimer = document.querySelector('.timer');
    gTimeInterval = setInterval(function () {
        gGame.secsPassed++;
        var timeArr = new Date(gGame.secsPassed * 1000).toString().split(':');
        var minutes = timeArr[1];
        var seconds = timeArr[2].split(' ')[0];
        elTimer.innerText = `${minutes}:${seconds}`;
    }, 1000);
}

function stopClock() {
    clearInterval(gTimeInterval);
    gTimeInterval = null;
}


function setBestTime(levelSize) {
    var level = (levelSize === 4) ? 'besttimeeasy' : (levelSize === 8) ? 'besttimemedium' : 'besttimehard';
    var currGameTime = gGame.secsPassed;

    if (!localStorage[level] || currGameTime < +localStorage[level]) {
        localStorage.setItem(level, currGameTime);
        gLevel.bestTime = localStorage[level];
        renderBestTime();
    }
}

function renderBestTime() {
    if (gLevel.bestTime < 60) gElBestTimeDisplay.innerText = `⏰record: ${gLevel.bestTime} secs`
    else if (gLevel.bestTime > 60) {
        var bestTimeMins = (gLevel.bestTime / 60).toFixed(2)
        gElBestTimeDisplay.innerText = `⏰record: ${bestTimeMins} mins`
    }

}

/////////////// others


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}