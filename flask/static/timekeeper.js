const navStart = document.getElementById('nav-start')
const navSplits = document.getElementsByClassName('nav-splits')
const navFinish = document.getElementById('nav-finish')

const start = document.getElementById('start')
const splitGrids = document.getElementsByClassName('split-grid')
const finish = document.getElementById('finish')
const opener = document.getElementById('opener')

const clockHeader = document.getElementById('clock')

function resetNav() {
    navStart.classList.remove('checked')
    Array.from(navSplits).forEach(splitBtn => splitBtn.classList.remove('checked'))
    navFinish.classList.remove('checked')

    start.classList.add('hide')
    Array.from(splitGrids).forEach(splitGrid => splitGrid.classList.add('hide'))
    finish.classList.add('hide')

    opener.classList.add('hide')
}

navStart.onclick = () => {
    resetNav()
    navStart.classList.add('checked')
    start.classList.remove('hide')
}

navFinish.onclick = () => {
    resetNav()
    navFinish.classList.add('checked')
    finish.classList.remove('hide')
}

function navSplitBtn(btn) {
    resetNav()
    btn.classList.add('checked')
    splitGrids[parseInt(btn.dataset.splitindex)].classList.remove('hide')
}

clockHeader.onclick = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
}

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

window.eventObject = undefined

function updateRunner(runner) {
    const suffix = `-btn-${runner.runner_index}`
    let btns = []

    for (let i = 0; i < runner.splits.length; i++) {
        btns.push(document.getElementById(`split-${i}${suffix}`))
        btns[i].disabled = true
    }

    const runnerFinish = document.getElementById(`finish-btn-${runner.runner_index}`)

    if (runner.start > 0) {
        runnerFinish.disabled = false
        if (runner.splits[0] == 0) {
            btns[0].disabled = false
        }
    }
    
    for (let i = 1; i <= runner.splits.length; i++) {
        if (runner.splits[i] == 0 && runner.splits[i - 1] > 0) {
            btns[i].disabled = false
            btns[i-1].disabled = true
            break
        }
    }

    if (runner.finish > 0){
        runnerFinish.disabled = true
    }
}

function updateEvent() {
    window.eventObject.runners.forEach(runner => updateRunner(runner))
    UpdateStarts()
    updatePlacements()
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

const clock = document.getElementById('clock')
function timerTick() {
    if (!window.eventObject) {
        return
    }
    const reference = Date.now() + window.eventObject['server_time']
    if (window.eventObject.start > 0) {
        clock.innerText = formatTime(reference - window.eventObject.start)

        window.eventObject.runners.forEach(runner => {
            const suffix = `-clock-${runner.runner_index}`
            if (runner.start > 0) {

                for (let i = 0; i < runner.splits.length; i++) {
                    if (runner.splits[i] == 0){
                        if (i == 0) {
                            document.getElementById(`split-${i}${suffix}`).innerText = formatTime(reference - runner.start)
                        }
                        else {
                            document.getElementById(`split-${i}${suffix}`).innerText = formatTime(reference - runner.splits[i - 1])
                        }
                        break
                    }
                    else {
                        if (i == 0) {
                            document.getElementById(`split-${i}${suffix}`).innerText = formatTime(runner.splits[0] - runner.start)
                        }
                        else {
                            document.getElementById(`split-${i}${suffix}`).innerText = formatTime(runner.splits[i] - runner.splits[i - 1])
                        }
                    }
                }

                if (runner.finish == 0){
                    document.getElementById(`finish${suffix}`).innerText = formatTime(reference - runner.start)
                }
                else {
                    document.getElementById(`finish${suffix}`).innerText = formatTime(runner.finish - runner.start)
                }
                

            }
        })

    }
}
const controller = new AbortController();
animationInterval(1000, controller.signal, time => {
    timerTick()
})

const socket = io();

socket.on('connect', () => {
    socket.emit('event-request', 'update')
})

socket.on('disconnect', () => {
    clockHeader.classList.add('disconnected')
})

socket.on('event-reset', payload => {
    payload['server_time'] = payload['server_time'] - Date.now()
    if (window.eventObject) {
        if ((window.eventObject.start != payload.start && payload.start == 0) || window.eventObject.title != payload.title) {
            window.scrollTo(0, 0)
            location.reload()
        }
    }
    window.eventObject = payload
    clockHeader.classList.remove('disconnected')
    updateEvent()
})

function startEvent(e){
    socket.emit('start', {
        start: Date.now() + window.eventObject['server_time'],
        heat: parseInt(e.dataset.heat)
    })
}

function UpdateStarts() {
    const prefix = 'start-btn-heat-'
    window.eventObject.heats.started.forEach(i => {
        document.getElementById(`${prefix}${i}`).disabled = true
    })
    window.eventObject.heats.future.forEach(i => {
        document.getElementById(`${prefix}${i}`).disabled = true
    })
    if (window.eventObject.heats.next > 0) {
        document.getElementById(`${prefix}${window.eventObject.heats.next}`).disabled = false;
    }
}

function splitRunner(btn) {
    // btn.disabled = true
    socket.emit('split', {
        runner: parseInt(btn.dataset.runnerindex),
        timestamp: Date.now() + window.eventObject['server_time'],
        split: parseInt(btn.dataset.splitindex)
    })
}

function splitUnknown(btn) {
    socket.emit('split-unknown', {
        timestamp: Date.now() + window.eventObject['server_time'],
        split: parseInt(btn.dataset.splitindex)
    })
}

function finishRunner(btn) {
    // btn.disabled = true
    socket.emit('finish', {
        runner: parseInt(btn.dataset.runnerindex),
        timestamp: Date.now() + window.eventObject['server_time']
    })
}

function finishUnknown(btn) {
    socket.emit('finish-unknown', {
        timestamp: Date.now() + window.eventObject['server_time'],
    })
}

socket.on('runner-update', payload => {
    updateRunner(payload)
    window.eventObject.runners[payload.runner_index] = payload
    updatePlacements()
})

socket.on('unknown-update', payload => {
    window.eventObject.unknowns = payload
    updatePlacements()
})

function updatePlacements() {
    let placements = []
    let finishers = []
    const splitCount = window.eventObject.runners[0].splits.length

    for (let i = 0; i < splitCount; i++){
        placements.push([])
    }

    window.eventObject.runners.forEach(runner => {
        for (let i = 0; i < splitCount; i++){
            if (runner.splits[i] > 0) {
                place = {
                    runnerName: runner.name,
                    time: runner.splits[i] - runner.start,
                    jersey: runner.jersey,
                    color: runner.color,
                    display: formatPreciseTime(runner.splits[i] - runner.start),
                    timestamp: runner.splits[i],
                    ix: runner.runner_index,
                    split: i
                }
                placements[i].push(place)
            }
            else{
                break
            }
        }

        if (runner.finish > 0) {
            fin = {
                runnerName: runner.name,
                time: runner.finish - runner.start,
                jersey: runner.jersey,
                color: runner.color,
                display: formatPreciseTime(runner.finish - runner.start),
                timestamp: runner.finish,
                ix: runner.runner_index,
                split: "finish"
            }
            finishers.push(fin)
        }
    })

    window.eventObject.unknowns.splits.forEach((split, i) => {
        split.forEach(unknown => {
            place = {
                runnerName: unknown.name,
                time: unknown.split - unknown.start,
                jersey: unknown.jersey,
                color: unknown.color,
                display: formatPreciseTime(unknown.split - unknown.start),
                timestamp: unknown.split,
                ix: "unknown",
                split: i
            }
            placements[i].push(place)
        })
    })

    window.eventObject.unknowns.finish.forEach((unknown, i) => {
        fin = {
            runnerName: unknown.name,
            time: unknown.split - unknown.start,
            jersey: unknown.jersey,
            color: unknown.color,
            display: formatPreciseTime(unknown.split - unknown.start),
            timestamp: unknown.split,
            ix: "unknown",
            split: "finish"
        }
        finishers.push(fin)
    })

    for (let i = 0; i < splitCount; i++){
        placements[i].sort((a, b) => (a.time > b.time) ? 1 : -1)
        document.getElementById(`split-${i}-results`).innerHTML = placementsToResults(placements[i])
    }

    finishers.sort((a, b) => (a.time > b.time) ? 1 : -1)
    document.getElementById('finish-results').innerHTML = placementsToResults(finishers)

    window.finishers = finishers
    window.placements = placements
}

function placementsToResults(placements) {
    htmlString = ""
    placements.forEach((placement, p) => {
        addition = `
        <form class="split-result" onsubmit="return ChangeResult(this)" autocomplete="off">
            <div class="result-placement">${p + 1}</div>
            <input type="text" onclick="this.setSelectionRange(0, this.value.length)" class="result-jersey color ${placement.color}" inputmode="decimal" name="jersey" value="${placement.jersey}" data-initialindex="${placement.ix}" data-timestamp="${placement.timestamp}" data-split="${placement.split}">
            <div class="result-name">${placement.runnerName}</div>
            <div class="result-time">${placement.display}</div>
            <input type="submit" class="btn" value="Update">
        </form>
        `
        htmlString += addition
    })
    if (htmlString.length > 0) {
        return htmlString
    }
    else {
        return '<p>No Results Yet</p>'
    }
}

function ChangeResult(f) {
    jersey = f.elements.jersey

    payload = {
        jersey: jersey.value,
        initial: jersey.dataset.initialindex,
        timestamp: parseInt(jersey.dataset.timestamp),
        split: jersey.dataset.split
    }

    socket.emit('result-change', payload)

    return false
}