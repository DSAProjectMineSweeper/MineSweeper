
'use strict'

var gSneakPeekOn = false;

function sneakPeekOn() {
    if (gLevel.hints === 0) return;
    if (!gGame.isOn) return;
    gSneakPeekOn = true;
    gLevel.hints--;

    var elLightBulbs = document.querySelector('.sneak-peek');
    if (gLevel.size === 4) {
        elLightBulbs.innerText = '✖️';
        return;
    }

    if (gLevel.hints === 2) elLightBulbs.innerText = '💡💡✖️'
    else if (gLevel.hints === 1) elLightBulbs.innerText = '💡✖️✖️'
    else elLightBulbs.innerText = '✖️✖️✖️'
}

function showSneakPeek(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue;
            var currCell = gBoard[i][j];
            if (currCell.isShown || currCell.isMarked) continue;

            if (currCell.isMine) renderCell(i, j, MINE);
            else if (currCell.minesAroundCount) renderCell(i, j, currCell.minesAroundCount);
            else renderCell(i, j, ' ');
            var elCell = document.querySelector(`.cell${i}-${j}`);
            elCell.classList.add('peeked');

            setTimeout(renderCell, 1000, i, j, ' ');
            setTimeout(removeClass, 1000, i, j, 'peeked');

        }
    }
    gSneakPeekOn = false;
}


function showSafeCell() {
    if (!gGame.isOn) return;
    if (gLevel.safeClicks === 0) return;
    gLevel.safeClicks--;
    document.querySelector('.safe-click').innerText = (gLevel.safeClicks === 1) ? `🧐` : (gLevel.safeClicks === 2) ? '🧐🧐' : ''
    var safeCells = [];

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine || currCell.isShown) continue;
            safeCells.push({ i: i, j: j });
        }
    }
    var rndIdx = safeCells[getRandomInt(0, safeCells.length)]
    document.querySelector(`.cell${rndIdx.i}-${rndIdx.j}`).classList.add('safe');
    setTimeout(removeClass, 2000, rndIdx.i, rndIdx.j, 'safe');
}

function undo() {
    if (!gGame.isOn) return;
    if (!gMoves.length) return;
    var move = gMoves.pop();
    if (Array.isArray(move)) {
        for (var i = 0; i < move.length; i++) {
            var currMove = move[i];
            reverseMove(currMove);
        }
    }
    else reverseMove(move);

}

function reverseMove(obj) {
    obj.isShown = false;
    if (obj.isMine) {
        gLevel.lives++;
        gElLives.innerText = (gElLives.innerText === '💟💟💔') ? '💟💟💟' : '💟💟💔';
        document.querySelector('.player').innerText = HAPPY;
    }
    document.querySelector(`.cell${obj.pos.i}-${obj.pos.j}`).classList.remove('pressed');
    renderCell(obj.pos.i, obj.pos.j, ' ');
}
