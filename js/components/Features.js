class Features{
    constructor(){
        this.gMoves = [];
        this.gNrMoves = [];
        this.gSneakPeekOn = false;
    }

    sneakPeekOn() {
        if (game.gLevel.hints === 0) return;
        if (!game.gGame.isOn) return;
        this.gSneakPeekOn = true;
        game.gLevel.hints--;
    
        var elLightBulbs = document.querySelector('.sneak-peek');
        if (game.gLevel.size === 4) {
            elLightBulbs.innerText = '✖️';
            return;
        }
    
        if (game.gLevel.hints === 2) elLightBulbs.innerText = '💡💡✖️'
        else if (game.gLevel.hints === 1) elLightBulbs.innerText = '💡✖️✖️'
        else elLightBulbs.innerText = '✖️✖️✖️'
    }

    showSneakPeek(rowIdx, colIdx) {
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i > game.gBoard.length - 1) continue;
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (j < 0 || j > game.gBoard[0].length - 1) continue;
                var currCell = game.gBoard[i][j];
                if (currCell.isShown || currCell.isMarked) continue;
    
                if (currCell.isMine)    renderer.renderCell(i, j, MINE);
                else if (currCell.minesAroundCount) renderer.renderCell(i, j, currCell.minesAroundCount);
                else renderer.renderCell(i, j, ' ');
                var elCell = document.querySelector(`.cell${i}-${j}`);
                elCell.classList.add('peeked');
    
                setTimeout(renderer.renderCell, 1000, i, j, ' ');
                setTimeout(this.removeClass, 1000, i, j, 'peeked');
    
            }
        }
        this.gSneakPeekOn = false;
    }

    removeClass(i, j, cls) {
        var elCell = document.querySelector(`.cell${i}-${j}`);
        elCell.classList.remove(cls);
    }

    showSafeCell() {
        if (!game.gGame.isOn) return;
        if (game.gLevel.safeClicks === 0) return;
        game.gLevel.safeClicks--;
        document.querySelector('.safe-click').innerText = (game.gLevel.safeClicks === 1) ? `🧐` : (game.gLevel.safeClicks === 2) ? '🧐🧐' : ''
        var safeCells = [];
    
        for (var i = 0; i < game.gBoard.length; i++) {
            for (var j = 0; j < game.gBoard[0].length; j++) {
                var currCell = game.gBoard[i][j];
                if (currCell.isMine || currCell.isShown) continue;
                safeCells.push({ i: i, j: j });
            }
        }
        var rndIdx = safeCells[HelpMethods.getRandomInt(0, safeCells.length)]
        document.querySelector(`.cell${rndIdx.i}-${rndIdx.j}`).classList.add('safe');
        setTimeout(this.removeClass, 2000, rndIdx.i, rndIdx.j, 'safe');
    }

    undo() {
        if (!game.gGame.isOn) return;
        if (!this.gMoves.length) return;
        var move = this.gMoves.pop();
        if (Array.isArray(move)) {
            for (var i = 0; i < move.length; i++) {
                var currMove = move[i];
                this.reverseMove(currMove);
            }
        }
        else this.reverseMove(move);
    
    }

    reverseMove(obj) {
        obj.isShown = false;
        if (obj.isMine) {
            game.gLevel.lives++;
            gElLives.innerText = (gElLives.innerText === '💟💟💔') ? '💟💟💟' : '💟💟💔';
            document.querySelector('.player').innerText = HAPPY;
        }
        document.querySelector(`.cell${obj.pos.i}-${obj.pos.j}`).classList.remove('pressed');
        renderer.renderCell(obj.pos.i, obj.pos.j, ' ');
    }
}