class Renderer {
    constructor() {
        
    }
    handleAudio() {
        var elAudioControl = document.querySelector('.audio-control');
        if (game.gGame.isSoundOn) {
            game.gGame.isSoundOn = false;
            elAudioControl.innerText = '🔇 muted'
        }
        else {
            game.gGame.isSoundOn = true;
            elAudioControl.innerText = '🔊 sound on'
        }
    }

    renderBoard(board) {
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

    renderCell(i, j, value) {
        var elCell = document.querySelector(`.cell${i}-${j}`);
        elCell.innerHTML = value;
    }

    renderBombs() {
        for (var i = 0; i < game.gBoard.length; i++) {
            for (var j = 0; j < game.gBoard[0].length; j++) {
                if (game.gBoard[i][j].isMine) this.renderCell(i, j, MINE);
            }
        }
    }

    renderNegs(mat, rowIdx, colIdx) {
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i > mat.length - 1) continue;
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (j < 0 || j > mat[0].length - 1) continue;
                if (i === rowIdx && j === colIdx) continue;
    
                var currNr = mat[i][j];
                if (currNr.isMarked || currNr.isShown) continue;
                feature.gNrMoves.push(currNr);
    
                this.renderCell(i, j, currNr.minesAroundCount);
                currNr.isShown = true;
                document.querySelector(`.cell${i}-${j}`).classList.add('pressed');
                if (!currNr.minesAroundCount) this.renderNegs(mat, i, j);
            }
        }
    }
}