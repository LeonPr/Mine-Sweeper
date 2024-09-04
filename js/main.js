
'use strict'


const MINE = '🎇'
const FLAG = '🚩'

const gField = []
const gLevel = { SIZE: 4, MINES: 2 }
const gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 }

const gIsCellMine = false
const resCount = 1
const resUpdate = 2
const gBeginner = 4
const gMedium = 8
const gExpert = 12


var gMinesCount
var firstClick = true

function onInit() {
    gMinesCount = 0
    document.getElementById("Beginner").checked = true;
    createField()
    /*addMines()                 first click free
    updateFieldsMinesCount()*/
    renderField()
}
function startNewGame() {
    gMinesCount = 0
    firstClick = true
    if (document.getElementById("Beginner").checked) {
        gLevel.SIZE = gBeginner
        gLevel.MINES = 2
    } else if (document.getElementById("Medium").checked) {
        gLevel.SIZE = gMedium
        gLevel.MINES = 14
    } else if (document.getElementById("Expert").checked) {
        gLevel.SIZE = gExpert
        gLevel.MINES = 32
    }
    createField()
    /*addMines()                             first click free
    updateFieldsMinesCount()*/
    renderField()
}
function disableContextMenu() {
    const noContext = document.getElementById("oncontextmenu");
    noContext.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    })
}

function mouseClick(ele, e) {

    const eleId = ele.id + ''
    const indxI = +eleId.substring(0, eleId.indexOf(','))
    const indxJ = +eleId.substring(eleId.indexOf(',') + 1)
    if (gField[indxI][indxJ].isShown) return

    /*if (e.type == 'click') {
         //alert('Left Click Detected!');
     }*/
    if (e.type == 'contextmenu') {
        if(ele.innerHTML === FLAG){
            ele.innerHTML = ''
        }else{
            ele.innerHTML = FLAG
        }
        
        //alert('Right Click Detected!');
        //onCellClickedRight(ele)
    }

}

function onResetGameLevel(elbtn) {

}

function createField() {
    //const mineField = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        gField[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            gField[i][j] = cell
        }
    }
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

            strHTML += `\t<td title="${title}" id="${i}, ${j}" class="cell ${className}" 
                            oncontextmenu="mouseClick(this, event);return false;" onclick="onCellClicked(this, ${i}, ${j})" >
                         </td>\n`
        }
        strHTML += `</tr>\n`
    }

    const elFields = document.querySelector('.minefield-field')
    elFields.innerHTML = strHTML
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
    if (firstClick) {
        firstClick = false
        addMines(i, j)
        updateFieldsMinesCount()
        renderField()
    }
    
    if(elCell.innerHTML===FLAG) return
    if (gField[i][j].isMine) {
        renderCell(i, j, !gIsCellMine)
        gGame.isOn = false
    } else {
        renderCell(i, j, gIsCellMine)
    }
}

function addMines(rowIdx, colIdx) {
    var mineNum = 0
    var randI = -1
    var randJ = -1
    if (gLevel.SIZE === gBeginner) {
        mineNum = 2
    } else if (gLevel.SIZE === gMedium) {
        mineNum = 14
    } else if (gLevel.SIZE === gExpert) {
        mineNum = 32
    }
    for (var i = 0; i < mineNum; i++) {
        randI = getRandomInt(0, gLevel.SIZE)
        randJ = getRandomInt(0, gLevel.SIZE)
        if (gField[randI][randJ].isMine) {
            i--
        } else if (rowIdx === randI && colIdx === randJ) {
            i--
        } else {
            gField[randI][randJ].isMine = true
        }
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
                gField[i][j].isShown = true
                if (gField[i][j].minesAroundCount === 0) {
                    elCell.classList.add('pressedEmpty')
                    elCell.innerHTML = ''
                } else {
                    elCell.classList.add(`pressed${gField[i][j].minesAroundCount}`)
                    elCell.innerHTML = gField[i][j].minesAroundCount
                }
            }
        }
    }
    if (resType === 1) {
        return count
    }

}

function renderCell(rowIdx, colIdx, isCellMine) {
    if (gField[rowIdx][colIdx].isShown) return
    if (isCellMine) {
        const elMines = document.querySelectorAll('.mine')
        for (var i = 0; i < elMines.length; i++) {
            elMines[i].innerHTML = MINE
        }
    } else {
        const elCell = document.querySelector(`[title="Cell: ${rowIdx + 1}, ${colIdx + 1}"]`)
        gField[rowIdx][colIdx].isShown = true
        if (gField[rowIdx][colIdx].minesAroundCount === 0) {
            elCell.innerHTML = ''
            elCell.classList.add('pressedEmpty')
            getNearMines(rowIdx, colIdx, resUpdate)
        } else {
            elCell.classList.add(`pressed${gField[rowIdx][colIdx].minesAroundCount}`)
            getNearMines(rowIdx, colIdx, resUpdate)
        }
    }
}

