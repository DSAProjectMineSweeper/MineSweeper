function renderBoard(board){
    var strHTML = '';

    for(var i = 0; i < board.length; i++){
        strHTML += '<tr>';
        for(var j = 0; j < board[0].length; j++){
            var className = `cell cell${i - j}` /// create a class name for eachc cell
            /// 'onclick' attributes is set to call the 'cellClicked' function (when clicked)
            strHTML += `<td class="${className}" onclick="cellClicked(this, ${i}, ${j})"></td>`
        }
        strHTML += '</tr>';
    }
    document.querySelector('.game-board table').innerHTML = strHTML;
}

/// Renders the content of a specific cell at coordinates (i,j) 
/// with the provided value
function renderCell(i, j, value){
    var elCell = document.querySelector(`.cell${i - j}`);
    elCell.innerHTML = value;
}

/// return a random integer btw min and max
function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
}