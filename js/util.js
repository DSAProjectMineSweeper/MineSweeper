function renderBoard(board){
    var strHTML = '';

    for(var i = 0; i < board.length; i++){
        strHTML += '<tr>';
        for(var j = 0; j < board[0].length; j++){
            var className = `cell cell${i}-${j}` /// create a class name for each cell
            /// 'onclick' attributes is set to call the 'cellClicked' function (when clicked)
            strHTML += `<td class="${className}" onclick="cellClicked(this, ${i}, ${j})"
            oncontextmenu="handleFlag(${i}, ${j}); return false;"></td>`;
        }
    }
    strHTML += '</tr>';
    document.querySelector('.game-board table').innerHTML = strHTML;
}

/// Renders the content of a specific cell at coordinates (i,j) 
/// with the provided value

function renderCell(i, j, value){
    var elCell = document.querySelector(`.cell${i}-${j}`);
    elCell.innerHTML = value;
}

function renderBombs(){
    for(var i = 0; i < gBoard.length; i++){
        for(var j = 0; j < gBoard[0].length; j++){
            if(gBoard[i][j].isMine) renderCell(i, j, MINE);
        }
    }
}

var gNrMoves = [];

function renderNegs(mat, rowIdx, colIdx, degree){
    for(var i = rowIdx - 1; i <= rowIdx + 1; i++){
        if(i < 0 || i > mat.length - 1) continue;
        for(var j = colIdx - 1; j <= colIdx + 1; j++){
            if(j < 0 || j > mat[0].length - 1) continue;
            
            var currNr = mat[i][j];
            if(currNr.isMarked || currNr.isShown) continue;
            gNrMoves.push(currNr);

            renderCell(i, j, currNr.minesAroundCount);
            currNr.isShown = true;

            document.querySelector(`.cell${i}-${j}`).classList.add('pressed');

            if(degree === 1) return;

            if(!currNr.minesAroundCount) renderNegs(mat, i, j);
        }
    }
}

// needed for the showSneakPeek() funcction's loop
function removeClass(i, j, cls){
    var elCell = document.querySelector(`.cell${i}-${j}`);
    elCell.classList.remove(cls);
}

/// timer related functions

//////timer
var gStartTime;
var gTimeElasped;
var gTimeInterval;
var gElBestTimeDisplay = document.querySelector('.best-time');

function startClock(){
    var elTimer = document.querySelector('.timer');
    gTimeInterval = setInterval(function (){
        gGame.secsPassed++;
        var timeArr = new Date(gGame.secsPassed * 1000).toString().split(':');
        var minutes = timeArr[1];
        var seconds = timeArr[2].split(' ')[0];
        elTimer.innerText = `${minutes}:${seconds}`;
    }, 1000);
}

function stopClock(){
    clearInterval(gTimeInterval);
    gTimeInterval = null;
}

function checkBestTime(levelSize){
    var currGameTime = gGame.secsPassed;
    if (levelSize === 4) {
        if (currGameTime < +localStorage.besttimeeasy) localStorage.besttimeeasy = currGameTime;
        gLevel.bestTime = localStorage.besttimeeasy;
    } else if (levelSize === 8) {
        if (currGameTime < +localStorage.besttimemedium) localStorage.besttimemedium = currGameTime;
        gLevel.bestTime = localStorage.besttimemedium;
    } else if (levelSize === 12) {
        if (currGameTime < +localStorage.besttimehard) localStorage.besttimehard = currGameTime;
        gLevel.bestTime = localStorage.besttimehard;
    }
}

function updateBestTime(){
    if (!gLevel.bestTime || gLevel.bestTime === Infinity) return;

    if (gLevel.bestTime < 60) gElBestTimeDisplay.innerText = `⏰ record: ${gLevel.bestTime} secs`
    else if (gLevel.bestTime > 60) {
        var bestTimeMins = (gLevel.bestTime / 60).toFixed(2)
        gElBestTimeDisplay.innerText = `⏰ record: ${bestTimeMins} mins`
    }
}



/// return a random integer btw min and max
function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
}