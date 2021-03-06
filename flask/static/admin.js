const clock = document.getElementById('clock')

// Huge shout out to Jake Archibald for this work of brilliance
// https://gist.github.com/jakearchibald/cb03f15670817001b1157e62a076fe95
function animationInterval(ms, signal, callback) {
    const start = document.timeline.currentTime;

    function frame(time) {
        if (signal.aborted) return;
        callback(time);
        scheduleFrame(time);
    }

    function scheduleFrame(time) {
        const elapsed = time - start;
        const roundedElapsed = Math.round(elapsed / ms) * ms;
        const targetNext = start + roundedElapsed + ms;
        const delay = targetNext - performance.now();
        setTimeout(() => requestAnimationFrame(frame), delay);
    }

    scheduleFrame(start);
}

function formatTime(milliseconds) {
    const dateReference = new Date(milliseconds)
    minutes = dateReference.getUTCMinutes().toString()
    seconds = dateReference.getSeconds().toString().padStart(2, '0')
    return `${minutes}:${seconds}`
}

function formatPreciseTime(milliseconds){
    const dateReference = new Date(milliseconds)
    minutes = dateReference.getUTCMinutes().toString()
    seconds = dateReference.getSeconds().toString().padStart(2, '0')
    fractionalSecond = (milliseconds % 1000) / 1000
    rounded = (Math.round(fractionalSecond * 10) / 10).toString()
    rounded = rounded.slice(-1)
    return `${minutes}:${seconds}.${rounded}`
}

function timerTick() {
    const reference = Date.now() + window.eventObject['server_time']
    if (window.eventObject.start > 0) {
        clock.innerText = formatTime(reference - window.eventObject.start)
    }
}

const controller = new AbortController();
animationInterval(1000, controller.signal, time => {
    timerTick()
})

function updateEvent() {
    window.eventObject.runners.forEach(runner => updateRunner(runner))
}

function updateRunner(runner) {
    if (runner.start > 0) {
        const prefix = `runner${runner.runner_index}`
        for (let i=0; i < runner.splits.length; i++) {
            let idPrefix = `${prefix}-split-${i}`
            if (runner.splits[i] > 0) {
                if (i == 0){
                    total = runner.splits[i] - runner.start
                    split = runner.splits[i] - runner.start
                }
                else {
                    split = runner.splits[i] - runner.splits[i - 1]
                    total = runner.splits[i] - runner.start
                }
    
                document.getElementById(`${idPrefix}-split`).innerText = formatPreciseTime(split)
                document.getElementById(`${idPrefix}-total`).innerText = formatPreciseTime(total)
            }
            else {
                document.getElementById(`${idPrefix}-split`).innerText = ''
                document.getElementById(`${idPrefix}-total`).innerText = ''
            }
        }

        if (runner.finish > 0) {
            if (runner.splits.length > 0 && runner.splits[runner.splits.length - 1] > 0) {
                split = runner.finish - runner.splits[runner.splits.length - 1]
                total = runner.finish - runner.start
            }
            else {
                total = runner.finish - runner.start
                split = runner.finish - runner.start
            }

            document.getElementById(`${prefix}-finish-split`).innerText = formatPreciseTime(split)
            document.getElementById(`${prefix}-finish-total`).innerText = formatPreciseTime(total)
        }
        else {
            document.getElementById(`${prefix}-finish-split`).innerText = ''
            document.getElementById(`${prefix}-finish-total`).innerText = ''
        }
    }
}

const socket = io();

socket.on('connect', () => {
    socket.emit('event-request', 'update')
})

socket.on('disconnect', () => {
    clock.classList.add('disconnected')
})

socket.on('event-reset', payload => {
    payload['server_time'] = payload['server_time'] - Date.now()
    if (window.eventObject) {
        if ((window.eventObject.start != payload.start && payload.start == 0) || window.eventObject.title != payload.title) {
            location.reload()
        }
    }
    window.eventObject = payload
    clock.classList.remove('disconnected')
    updateEvent()
})

socket.on('runner-update', payload => {
    updateRunner(payload)
    window.eventObject.runners[payload.runner_index] = payload
})

window.eventObject = undefined

const exportBtn = document.getElementById('export-btn')

exportBtn.onclick = exportCSV

function exportCSV() {
    saveAs('/export', `${window.eventObject.title} Splits.csv`)
}

function ToggleBehavior(btnA, btnB, action) {
    btnA.classList.toggle('toggled')
    btnB.classList.toggle('toggled')
    action()
}

const tClockNo = document.getElementById('toggle-clock-no')
const tClockYes = document.getElementById('toggle-clock-yes')
function ClockVisibilityChange() {
    ChangeVisibility('clock')
}
tClockNo.onclick = () => {ToggleBehavior(tClockNo, tClockYes, ClockVisibilityChange)}
tClockYes.onclick = () => {ToggleBehavior(tClockNo, tClockYes, ClockVisibilityChange)}

const tSplitNo = document.getElementById('toggle-splits-no')
const tSplitYes = document.getElementById('toggle-splits-yes')
function SplitVisibilityChange() {
    ChangeVisibility('placement')
}
tSplitNo.onclick = () => {ToggleBehavior(tSplitNo, tSplitYes, SplitVisibilityChange)}
tSplitYes.onclick = () => {ToggleBehavior(tSplitNo, tSplitYes, SplitVisibilityChange)}

const tSplitAutoNo = document.getElementById('toggle-splits-auto-no')
const tSplitAutoYes = document.getElementById('toggle-splits-auto-yes')
function SplitAutoVisibilityChange() {
    ChangeVisibility('on_new')
}
tSplitAutoNo.onclick = () => {ToggleBehavior(tSplitAutoNo, tSplitAutoYes, SplitAutoVisibilityChange)}
tSplitAutoYes.onclick = () => {ToggleBehavior(tSplitAutoNo, tSplitAutoYes, SplitAutoVisibilityChange)}

const tLowerThirdNo = document.getElementById('toggle-lower-third-no')
const tLowerThirdYes = document.getElementById('toggle-lower-third-yes')
function LowerThirdVisibilityChange() {
    ChangeVisibility('lower_third')
}
tLowerThirdNo.onclick = () => {ToggleBehavior(tLowerThirdNo, tLowerThirdYes, LowerThirdVisibilityChange)}
tLowerThirdYes.onclick = () => {ToggleBehavior(tLowerThirdNo, tLowerThirdYes, LowerThirdVisibilityChange)}

window.adminObject = undefined
const admin = io('/admin');

admin.on('connect', () => {
    admin.emit('admin-request', 'update')
})

admin.on('admin-reset', payload => {
    window.adminObject = payload
    UpdateAdmin()
})

admin.on('visibility-update', payload => {
    window.adminObject.visibility[payload.key] = payload.state
    UpdateAdmin()
})

function UpdateVisibilityToggle(key, negative, positive) {
    if (window.adminObject.visibility[key]) {
        negative.classList.remove('toggled')
        positive.classList.add('toggled')
    }
    else {
        negative.classList.add('toggled')
        positive.classList.remove('toggled')
    }
}

function UpdateAdmin() {
    UpdateVisibilityToggle('clock', tClockNo, tClockYes)
    UpdateVisibilityToggle('placement', tSplitNo, tSplitYes)
    UpdateVisibilityToggle('on_new', tSplitAutoNo, tSplitAutoYes)
    UpdateVisibilityToggle('lower_third', tLowerThirdNo, tLowerThirdYes)
    UpdateLowerThird()
}

function ChangeVisibility(key) {
    let newState = !window.adminObject.visibility[key]
    window.adminObject.visibility[key] = newState

    admin.emit('visibility', {key: key, state: newState})
}

const lowerThirdTitlePreview = document.getElementById('lower-third-preview-title')
const lowerThirdSubtitlePreview = document.getElementById('lower-third-preview-subtitle')

const lowerThirdTitleInput = document.getElementById('lower-third-title-input')
const lowerThirdSubtitleInput = document.getElementById('lower-third-subtitle-input')

const lowerThirdDisplay = document.getElementById('lower-third-display')
const lowerThirdClear = document.getElementById('lower-third-clear')

function UpdateLowerThird() {
    lowerThirdTitlePreview.innerText = window.adminObject.lower_third.title
    lowerThirdSubtitlePreview.innerText = window.adminObject.lower_third.subtitle
}

lowerThirdClear.onclick = () => {
    lowerThirdSubtitleInput.value = ''
    lowerThirdTitleInput.value = ''
}

lowerThirdDisplay.onclick = () => {
    if (lowerThirdTitleInput.value.length > 0) {
        admin.emit('lower_third', {
            title: lowerThirdTitleInput.value,
            subtitle: lowerThirdSubtitleInput.value
        })

        lowerThirdSubtitleInput.value = ''
        lowerThirdTitleInput.value = ''
    }
}

admin.on('lower_third_update', payload => {
    window.adminObject.lower_third = payload
    UpdateLowerThird()
})

document.getElementById('new-race').onclick = importCSV

async function importCSV() {
    [handle] = await window.showOpenFilePicker({
        multiple: false,
        excludeAcceptAllOption: true,
        types: [{accept: {'text/csv': ['.csv']}}]
    })

    fileData = await handle.getFile()
    csv = await fileData.text()

    payload = new FormData()

    payload.append('csv', csv)

    let u = new URL(window.location.href)
    let key = u.searchParams.get('key') 

    fetch(`/newrace?key=${key}`, {
        method: 'POST',
        cache: 'no-cache',
        body: payload
    }).then(res => {
        window.location.href = window.location.href
    })
}

const splitTableArrow = document.getElementById('split-accordian-btn')
const splitTable = document.getElementById('split-table')
splitTable.style.maxHeight = splitTable.scrollHeight + "px"
splitTableArrow.onclick = () => {
    splitTableArrow.classList.toggle('up')
    if (splitTable.style.maxHeight) {
        splitTable.style.maxHeight = null
    }
    else {
        splitTable.style.maxHeight = splitTable.scrollHeight + "px"
    }
}