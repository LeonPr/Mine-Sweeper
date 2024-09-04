
'use strict'


const MINE = '🎇'


const gField = []
const gLevel = { SIZE: 4, MINES: 2 }
const gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 }
const gIsCellMine = false
const resCount = 1
const resUpdate = 2

var gMinesCount


function onInit() {
    gMinesCount = 0
    document.getElementById("Beginner").checked = true;
    createField()
    renderField()
    //disableContextMenu()

}
function disableContextMenu() {
    const noContext = document.getElementById("oncontextmenu");
    console.log('noContext', noContext);
    noContext.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    })
}

function mouseClick(ele, e) {
    console.log('e',e)
    console.log('ele', ele);
    if (e.type == 'click') {
        alert('Left Click Detected!');
    }
    if (e.type == 'contextmenu') {
        alert('Right Click Detected!');
    }
}

function onMouseD(eEvent) {
    console.log('eEvent', eEvent)
}

function startNewGame() {
    var x = document.getElementById("Beginner").checked;
}

function createField() {
    //const mineField = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        gField[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: i % j === 0 ? true : false,
                isMarked: false
            }
            gField[i][j] = cell
        }
    }
    //console.log(' createField gField', gField);
    //mineField[4][4].isMine = true
    updateFieldsMinesCount()
}
function renderField() {
    var strHTML = ''

    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr class="minefield-row" >\n`
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gField[i][j]

            // For a cell of type MINE add mine class
            var className = (cell.isMine) ? 'field' : ''

            // For a cell that is booked add booked class
            if (cell.isMine) {
                className += ' mine'
            }
            // Add a seat title
            const title = `Cell: ${i + 1}, ${j + 1}`

            strHTML += `\t<td title="${title}" class="cell ${className}" 
                            onclick="onCellClicked(this, ${i}, ${j})" >
                         </td>\n`
        }
        strHTML += `</tr>\n`
    }

    const elSeats = document.querySelector('.minefield-field')
    elSeats.innerHTML = strHTML
}
function updateFieldsMinesCount() {
    for (var i = 0; i < gField.length; i++) {
        for (var j = 0; j < gField[0].length; j++) {
            if (!gField[i][j].isMine) {
                gField[i][j].minesAroundCount = getNearMines(i, j, resCount)
            }
        }
    }
}
function onCellClicked(elCell, i, j) {
    if (gField[i][j].isMine) {
        renderCell(i, j, !gIsCellMine)
        gGame.isOn = false
    } else {
        renderCell(i, j, gIsCellMine)
    }
}
function onCellMarked(elCell) {
    //todo: right click check
}
function getNearMines(rowIdx, colIdx, resType) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gField.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gField[i].length) continue
            if (gField[i][j].isMine && resType === resCount) {
                count++
            } else if (!gField[i][j].isMine && resType === resUpdate) {
                const elCell = document.querySelector(`[title="Cell: ${i + 1}, ${j + 1}"]`)
                elCell.innerHTML = gField[i][j].minesAroundCount
            }
        }
    }
    if (resType === 1) {
        return count
    }

}

function renderCell(rowIdx, colIdx, isCellMine) {
    if (isCellMine) {
        const elMines = document.querySelectorAll('.mine')
        for (var i = 0; i < elMines.length; i++) {
            elMines[i].innerHTML = MINE
        }
    } else {
        const elCell = document.querySelector(`[title="Cell: ${rowIdx + 1}, ${colIdx + 1}"]`)
        elCell.innerHTML = gField[rowIdx][colIdx].minesAroundCount
        getNearMines(rowIdx, colIdx, resUpdate)
    }
}

