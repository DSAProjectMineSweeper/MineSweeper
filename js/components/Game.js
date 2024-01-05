class Game {
    constructor() {
      this.gBoard = [];
      this.gGame = {
        isOn: false,
        firstClick: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isSoundOn: true,
      };
      this.gLevel = {
        size: 4,
        mines: 2,
        lives: 1,
        bestTime: +localStorage.besttimeeasy,
        safeClicks: 1,
      };
    }
  
    init() {
      gElPlayer.innerText = NORMAL;
      this.gBoard = this.buildBoard(this.gLevel.size);
      renderer.renderBoard(this.gBoard);
  
      gElLives.innerText = (this.gLevel.size === 4) ? '💟' : '💟💟💟';
      document.querySelector('.sneak-peek').innerText = (this.gLevel.size === 4) ? '💡' : '💡💡💡';
      document.querySelector('.safe-click').innerText = (this.gLevel.size === 4) ? `🧐` : (this.gLevel.size === 8) ? '🧐🧐' : '🧐🧐🧐'
  
      if (!this.gLevel.bestTime) return;
      timer.renderBestTime();
    }
  
    buildBoard() {
        var board = [];
        for (var i = 0; i < this.gLevel.size; i++) {
            board.push([]);
            for (var j = 0; j < this.gLevel.size; j++) {
                var cell = {
                    minesAroundCount: null,
                    isShown: false,
                    isMine: false,
                    isMarked: false,
                    pos: { i: i, j: j }
                }
                board[i].push(cell);
            }
        }
        return board;
    }

    placeMines(num, iExclude, jExclude) {
        var mineCount = 0;
        while (mineCount < num) {
            var i = HelpMethods.getRandomInt(0, this.gBoard.length);
            var j = HelpMethods.getRandomInt(0, this.gBoard[0].length);
    
            if (this.gBoard[i][j].isMine) continue;
            if (i === iExclude && j === jExclude) continue;
    
            this.gBoard[i][j].isMine = true;
            mineCount++;
        }
    }

    countMines(mat, rowIdx, colIdx) {
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

    setMinesNegsCount() {
        for (var i = 0; i < this.gBoard.length; i++) {
            for (var j = 0; j < this.gBoard[0].length; j++) {
                if (this.gBoard[i][j].isMine) continue;
                var minesCount = this.countMines(this.gBoard, i, j);
                if (!minesCount) minesCount = '';
                this.gBoard[i][j].minesAroundCount = minesCount;
            }
        }
    }
  
    cellClicked(elCell, i, j) {
        var cell = this.gBoard[i][j];
        if (cell.isMarked) return;
    
        ///first click of the game- places mines and sets game on
        if (!this.gGame.isOn && this.gGame.firstClick) {
            this.placeMines(this.gLevel.mines, i, j);
            this.gGame.isOn = true;
            this.gGame.firstClick = false;
            timer.startClock();
            this.setMinesNegsCount();
            gElPlayer.innerText = HAPPY;
        }
        ///sneak peek
        else if (feature.gSneakPeekOn) {
            feature.showSneakPeek(i, j);
            return;
        }
        ///mine
        else if (cell.isMine) {
            if (this.gGame.isSoundOn) soundManager.playBombSound();
            cell.isShown = true;
            /// in case life left
            if (this.gLevel.lives > 1) {
                this.gLevel.lives--;
                feature.gMoves.push(cell);
                renderer.renderCell(i, j, MINE);
                if (this.gLevel.lives === 2) gElLives.innerText = '💟💟💔';
                else if (this.gLevel.lives === 1) gElLives.innerText = '💟💔💔';
                gElPlayer.innerText = SAD;
                return;
            }
            /// in case no lives left
            else if (this.gLevel.lives === 1) {
                renderer.renderBombs();
                this.gameOver('lost');
                return;
            }
        }
    
        /// rest- as long as game is on and cell is not mine
    
        if (this.gGame.isOn) {
            if (cell.minesAroundCount > 0) {
                elCell.innerText = cell.minesAroundCount;
                feature.gMoves.push(cell);
            }
            else {
                renderer.renderNegs(game.gBoard, i, j)
                feature.gMoves.push(feature.gNrMoves.slice());
                feature.gMoves[feature.gMoves.length - 1].push(cell);
                feature.gNrMoves = [];
            };
    
            /// in any case other than sneakpeek/mine:
            elCell.classList.add('pressed');
            cell.isShown = true;
            if (this.isWin()) this.gameOver('win');
        }
    }
  
    handleFlag(i, j) {
        var cell = this.gBoard[i][j];

        if (!this.gGame.isOn || cell.isShown && !cell.isMine) return;
    
        if (!cell.isMarked) {
            renderer.renderCell(i, j, FLAG);
            cell.isMarked = true;
            if (this.isWin()) this.gameOver('win');
        } else {
            if (cell.isMine && cell.isShown) return;
            renderer.renderCell(i, j, ' ');
            cell.isMarked = false;
        }
    }
  
    gameOver(status) {
        timer.stopClock();
        this.gGame.isOn = false;
        if (status === 'win') {
            gElPlayer.innerText = HAPPY_WIN;
            timer.setBestTime(this.gLevel.size);
            if (this.gGame.isSoundOn) soundManager.playWinSound();
        }
        else if (status === 'lost') {
            gElLives.innerText = (this.gLevel.size === 4) ? '💔' : '💔💔💔';
            gElPlayer.innerText = DEAD;
            if (this.gGame.isSoundOn) soundManager.playLoseSound();
        }
    }
  
    isWin() {
        for (var i = 0; i < this.gBoard.length; i++) {
            for (var j = 0; j < this.gBoard[0].length; j++) {
                if (this.gBoard[i][j].isMine && !this.gBoard[i][j].isMarked) return false;
                if (!this.gBoard[i][j].isMine && !this.gBoard[i][j].isShown) return false;
            }
        }
        return true;
    }
  
    restart() {
        timer.stopClock();
        this.gGame.isOn = false;
        this.gGame.firstClick = true;
        this.gGame.shownCount = 0;
        this.gGame.markedCount = 0;
        this.gGame.secsPassed = 0;
        document.querySelector('.timer').innerHTML = '00:00';
        this.gLevel.hints = (this.gLevel.size === 4) ? 1 : 3;
        this.gLevel.lives = (this.gLevel.size === 4) ? 1 : 3;
        this.gLevel.safeClicks = (this.gLevel.size === 4) ? 1 : (this.gLevel.size === 8) ? 2 : 3;
        feature.gMoves = [];
        feature.gNrMoves = [];
        document.querySelector('.best-time').innerText = '';
        this.init();
    }
}
  