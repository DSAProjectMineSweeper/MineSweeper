const MINE = '💣';

var gBoard;

var gGame ={
    isOn: false,
    showCount: 0,
    markedCount: 0,
    secsPassed: 0
}

/// Initialize the game by building the game board
/// rendering, and setting the initial values for game state
function init(){
    gBoard = buildBoard();
    renderBoard(gBoard);
    gGame.isOn = true;
    gGame.showCount = 0;
    gGame.markedCount = 0;
}

///Create 4x4 board with cell objects
function buildBoard(){
    var board = [];
    for(var i = 0; i < 4; i++){
        board.push([]);
        for(var j = 0; j < 4; j++){
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

///setting the mines around each cell
function setMinesNerCounts(){
    for(var i = 0; i < gBoard.length; i++){
        for(var j = 0; j < gBoard[0].length; j++){
            if (gBoard[i][j].isMine) continue;
            var minesCount = countMines(gBoard, i, j);
            gBoard[i][j].minesAroundCount = minesCount;
        }
    }
}

/// counting mines in the neighbouring cells
function countMines(mat, rowIdx, colIdx){
    var count = 0;
    for(var i = rowIdx - 1; i <= rowIdx + 1; i++){
        if(i < 0 || i > mat.length - 1) continue;
        for(var j = colIdx - 1; j <= colIdx + 1; j++){
            if(j < 0 || j > mat[0].length - 1) continue;
            var currCell = mat[i][j];
            if(currCell.isMine) count++;
        }
    }
    return count;
}

/// randomly placing mines on the board
function placeMines(num, iExclude, jExclude){
    var mineCount = 0;
    while(mineCount < num){
        var i = getRandomInt(0,gBoard.length);
        var j = getRandomInt(0, gBoard[0].length);

        if(gBoard[i][j].isMine) continue;
        if(i === iExclude && j === jExclude) continue;

        gBoard[i][j].isMine = true;
        mineCount++;
    }
}

/// handling cell clicks, revealing numbers or mines
function cellClicked(elCell, i, j){
    var cell = gBoard[i][j];
    if(!gGame.isOn){
        placeMines(2, i, j);
        gGame.isOn = true;
        setMinesNerCounts();
    }else if(cell.isMine){
        elCell.innerHTML = MINE;
        return;
        /// show all mines (render whole board)
        /// game over
    }
    if(cell.minesAroundCount > 0) elCell.innerHTML = cell.minesAroundCount;
}