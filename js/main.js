
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


var gMarkedMinesCount
var gShownFieldsCount
var firstClick = true
var gMinesForLevel

function onInit() {
    gMarkedMinesCount = 0
    gShownFieldsCount = 0
    document.getElementById("Beginner").checked = true;
    gMinesForLevel=2
    createField()
    renderField()
}
function startNewGame() {
    gMarkedMinesCount = 0
    gShownFieldsCount = 0
    firstClick = true
    if (document.getElementById("Beginner").checked) {
        gMinesForLevel = 2
        gLevel.SIZE = gBeginner
        gLevel.MINES = gMinesForLevel
    } else if (document.getElementById("Medium").checked) {
        gMinesForLevel = 14
        gLevel.SIZE = gMedium
        gLevel.MINES = gMinesForLevel
    } else if (document.getElementById("Expert").checked) {
        gMinesForLevel = 32
        gLevel.SIZE = gExpert
        gLevel.MINES = gMinesForLevel
    }
    createField()
    renderField()
    checkVictory()
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
    if (e.type == 'contextmenu') {
        if (ele.innerHTML === FLAG) {
            ele.innerHTML = ''
            gField[indxI][indxJ].isMarked = false
            gMarkedMinesCount--
        } else {
            ele.innerHTML = FLAG
            gField[indxI][indxJ].isMarked = true
            gMarkedMinesCount++
            checkVictory()
        }
    }
}

function createField() {
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
            // Add a Cell title
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
                gField[i][j].minesAroundCount = getMarkNearMines(i, j, resCount)
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

    if (elCell.innerHTML === FLAG) return
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


function getMarkNearMines(rowIdx, colIdx, resType) {
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
                if(gField[i][j].isShown !== true){
                    gField[i][j].isShown = true
                    gShownFieldsCount++
                }

                if (gField[i][j].minesAroundCount === 0) {
                    elCell.classList.add('pressedEmpty')
                    elCell.innerHTML = ''
                } else {
                    if (!gField[i][j].isMarked) {
                        elCell.classList.add(`pressed${gField[i][j].minesAroundCount}`)
                        elCell.innerHTML = gField[i][j].minesAroundCount
                    }else{
                        gShownFieldsCount--
                    }
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
        gShownFieldsCount++
        getMarkNearMines(+rowIdx, +colIdx, resUpdate)
        const elCell = document.querySelector(`[title="Cell: ${rowIdx + 1}, ${colIdx + 1}"]`)
        gField[rowIdx][colIdx].isShown = true
        if (gField[rowIdx][colIdx].minesAroundCount === 0) {
            elCell.innerHTML = ''
            elCell.classList.add('pressedEmpty')
        } else {
            elCell.classList.add(`pressed${gField[rowIdx][colIdx].minesAroundCount}`)
            elCell.innerHTML = gField[rowIdx][colIdx].minesAroundCount
        }
        checkVictory()
    }
}
function checkVictory() {
    if (gMinesForLevel === gMarkedMinesCount && gShownFieldsCount === (Number(gLevel.SIZE) ** 2 - gMinesForLevel)) {
        const elCell = document.querySelector('.victory')
        elCell.style.display = 'block'
    }else if(firstClick){
        const elCell = document.querySelector('.victory')
        elCell.style.display = 'none'
    }

}

