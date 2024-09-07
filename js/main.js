
'use strict'


const MINE = '🎇'
const FLAG = '🚩'
const HAPPY = '😀'
const SAD = '😣'
const VICTORY = '😎'
const HINTCLIKED = '📀'
const UNHINTCLIKED = '💿'

const gField = []
const gLevel = { SIZE: 8, MINES: 14 }
const gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 }

const gIsCellMine = false
const resCount = 1
const resUpdate = 2
const gBeginner = 4
const gMedium = 8
const gExpert = 12
const gAddAction = 'add'
const gRemoveAction = 'remove'
const gHtmlAction = 'html'
const gUndo = []
var gRecursion = []

var gMarkedMinesCount
var gShownFieldsCount
var firstClick = true
var gMinesForLevel
var gLife = 3
var gHintId = null
var gIntervalId
var gIntervalIdSave
var gIntervalIdTime
var gSaveClick = 3
var gStartTime

function onInit() {
    gMarkedMinesCount = 0
    gShownFieldsCount = 0
    document.getElementById("Medium").checked = true;
    gMinesForLevel = 14
    createField()
    renderField()
}
function startNewGame() {
    gMarkedMinesCount = 0
    gShownFieldsCount = 0
    gHintId = null
    firstClick = true
    gGame.secsPassed = 0
    gSaveClick = 3
    cellsStyling('.save-button span', 0, 0, '', 'Ethnocentrism', gAddAction, gSaveClick)
    gLife = 3
    cellsStyling('h3 span', 0, 0, '', 'Ethnocentrism', gAddAction, gLife)
    smileyMoods(HAPPY)
    enableHits()
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
    clearInterval(gIntervalIdTime)

    document.getElementById("timer").innerHTML = 'Timer: 00:00:00'
    document.getElementById("marked").innerHTML = 'Marked: ' + 0
    document.getElementById("opened").innerHTML = 'Opened: ' + 0
}


function updateStopwatch() {
    var currentTime = new Date().getTime();
    var elapsedTime = currentTime - gStartTime;
    var seconds = Math.floor(elapsedTime / 1000) % 60;
    var minutes = Math.floor(elapsedTime / 1000 / 60) % 60;
    var hours = Math.floor(elapsedTime / 1000 / 60 / 60);
    var displayTime = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
    document.getElementById("timer").innerHTML = 'Timer: ' + displayTime;
    gGame.secsPassed++
    document.getElementById("marked").innerHTML = 'Marked: ' + gMarkedMinesCount
    document.getElementById("opened").innerHTML = 'Opened: ' + gShownFieldsCount
}

function pad(number) {
    return (number < 10 ? "0" : "") + number;
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
        gGame.markedCount = gMarkedMinesCount
        
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

function onSaveClick() {
    if (gSaveClick === 0) return
    const saveArray = []
    for (var i = 0; i < gField.length; i++) {
        for (var j = 0; j < gField[0].length; j++) {
            if (!gField[i][j].isShown && !gField[i][j].isMine) {
                saveArray.push({ i, j })
            }
        }
    }
    gSaveClick--
    var randElm = getRandomInt(0, saveArray.length + 1)
    cellsStyling('title', saveArray[randElm].i, saveArray[randElm].j, `saveBnt`, '', gAddAction)
    gIntervalIdSave = setInterval(clearSaveClicks, 2000)
    cellsStyling('.save-button span', saveArray[randElm].i, saveArray[randElm].j, '', 'Ethnocentrism', gAddAction, gSaveClick)
}
function clearSaveClicks() {
    cellsStyling('.saveBnt', 0, 0, `saveBnt`, '', gRemoveAction)
    clearInterval(gIntervalIdSave)
}

function onCellClicked(elCell, i, j) {
    if (firstClick) {
        firstClick = false
        addMines(i, j)
        updateFieldsMinesCount()
        renderField()
        gStartTime = new Date().getTime()
        gIntervalIdTime = setInterval(updateStopwatch, 500)
    }

    if (elCell.innerHTML === FLAG) return
    if (gField[i][j].isMine) {
        renderCell(i, j, !gIsCellMine)
        gGame.isOn = false
    } else {
        renderCell(i, j, gIsCellMine)
    }
    if (gHintId) {
        gIntervalId = setInterval(clearHints, 1000)
    }
}
function clearHints() {
    const elHints = document.querySelectorAll('.pressedHint')
    for (var i = 0; i < elHints.length; i++) {
        const eleId = elHints[i].id + ''
        const indxI = +eleId.substring(0, eleId.indexOf(','))
        const indxJ = +eleId.substring(eleId.indexOf(',') + 1)
        if (!gField[indxI][indxJ].isShown) elHints[i].innerHTML = ''
        elHints[i].classList.remove('pressedHint')
    }
    const eBtn = document.getElementById(`${gHintId}`)
    eBtn.style.display = 'none'
    gHintId = null
    clearInterval(gIntervalId)
}
function enableHits() {
    const elHints = document.querySelectorAll('.hints-button')
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].innerHTML = UNHINTCLIKED
        elHints[i].style.display = 'inline-block'

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
    gRecursion.push(`${rowIdx},${colIdx}`)
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gField.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gField[i].length) continue
            if (gField[i][j].isMine && resType === resCount) {
                count++
            } else if ((!gField[i][j].isMine && resType === resUpdate) ||
                (gField[i][j].isMine && resType === resUpdate && gHintId)) {
                if (gField[i][j].isShown !== true) {
                    if (!gHintId) {
                        gField[i][j].isShown = true
                        gShownFieldsCount++
                    }
                }
                if (gField[i][j].minesAroundCount === 0) {
                    if (!gHintId) {
                        cellsStyling('title', i, j, `pressedEmpty`, '', gAddAction)
                        if (!gRecursion.includes(`${i},${j}`)) getMarkNearMines(i, j, resUpdate)
                    } else {
                        if (gField[i][j].isMine) {
                            cellsStyling('title', i, j, `pressedHint`, MINE, gAddAction)
                        } else {
                            cellsStyling('title', i, j, `pressedHint`, '', gAddAction)
                        }
                    }
                } else {
                    if (!gField[i][j].isMarked) {
                        if (!gHintId) {
                            cellsStyling('title', i, j, `pressed${gField[i][j].minesAroundCount}`, gField[i][j].minesAroundCount, gAddAction)

                        } else {
                            if (gField[i][j].isMine) {
                                cellsStyling('title', i, j, `pressedHint`, MINE, gAddAction)
                            } else {
                                cellsStyling('title', i, j, `pressedHint`, gField[i][j].minesAroundCount, gAddAction)
                            }
                        }
                    } else {
                        gShownFieldsCount--
                    }
                }
                gGame.shownCount = gShownFieldsCount
            }
        }
    }
    if (resType === 1) {
        return count
    }
    return
}

function manageMines(rowIdx, colIdx, isCellMine) {
    if (gLife > 0) {
        if (!gHintId) {
            gLife--
            cellsStyling('title', rowIdx, colIdx, ``, MINE, gAddAction)
            cellsStyling('h3 span', rowIdx, colIdx, '', 'Ethnocentrism', gAddAction, gLife)

        } else {
            cellsStyling('title', rowIdx, colIdx, `pressedHint`, MINE, gAddAction)
            cellsStyling('span', rowIdx, colIdx, `pressedHint`, '', gAddAction, gLife)
        }
    } else {
        smileyMoods(SAD)
        const elMines = document.querySelectorAll('.mine')
        for (var i = 0; i < elMines.length; i++) {
            elMines[i].innerHTML = MINE
        }
    }
}
function renderCell(rowIdx, colIdx, isCellMine) {
    if (gField[rowIdx][colIdx].isShown) return
    if (gLife === 0) {
        smileyMoods(SAD)
        clearInterval(gIntervalIdTime)
        return
    }
    if (isCellMine) {
        manageMines(rowIdx, colIdx, isCellMine)
    } else {
        if (!gHintId) gField[rowIdx][colIdx].isShown = true
        if (gField[rowIdx][colIdx].minesAroundCount === 0) {
            if (!gHintId) {
                cellsStyling('title', rowIdx, colIdx, 'pressedEmpty', '', gAddAction)
            } else {
                cellsStyling('title', rowIdx, colIdx, 'pressedHint', '', gAddAction)
            }
            gRecursion = []
            getMarkNearMines(+rowIdx, +colIdx, resUpdate)
        } else {
            if (!gHintId) {
                cellsStyling('title', rowIdx, colIdx, `pressed${gField[rowIdx][colIdx].minesAroundCount}`, gField[rowIdx][colIdx].minesAroundCount, gAddAction)

            } else {
                cellsStyling('title', rowIdx, colIdx, `pressedHint`, gField[rowIdx][colIdx].minesAroundCount, gAddAction)
                getMarkNearMines(+rowIdx, +colIdx, resUpdate)
            }
        }

        gShownFieldsCount++
        checkVictory()
    }
}

function cellsStyling(selector, rowIdx, colIdx, newClass = '', newHTML = 'Ethnocentrism', classAction, NewTXT = '') {

    if (selector === 'title') {
        var elCell = document.querySelector(`[title="Cell: ${rowIdx + 1}, ${colIdx + 1}"]`)
    } else {
        var elCell = document.querySelector(`${selector}`)
    }

    if (classAction === gAddAction) {
        if (newClass !== '') elCell.classList.add(`${newClass}`)
        if (newHTML !== 'Ethnocentrism') elCell.innerHTML = newHTML
        if (NewTXT !== '') elCell.innerText = NewTXT
    } else {
        elCell.classList.remove(`${newClass}`)
    }
}

function smileyMoods(mood) {
    const elCell = document.querySelector('.start')
    elCell.innerHTML = mood
}
function checkVictory() {
    if (gMinesForLevel === gMarkedMinesCount && gShownFieldsCount === (Number(gLevel.SIZE) ** 2 - gMinesForLevel)) {
        const elCell = document.querySelector('.victory')
        elCell.style.display = 'block'
        smileyMoods(VICTORY)
        clearInterval(gIntervalIdTime)
    } else if (firstClick) {
        const elCell = document.querySelector('.victory')
        elCell.style.display = 'none'
    }
}
function onHintsClick(eBtn) {
    if (eBtn.innerHTML === HINTCLIKED) {
        eBtn.innerHTML = UNHINTCLIKED
        gHintId = null
    } else {
        eBtn.innerHTML = HINTCLIKED
        gHintId = eBtn.id
    }
}