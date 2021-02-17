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
}

function formatTime(milliseconds) {
    const dateReference = new Date(milliseconds)
    minutes = dateReference.getUTCMinutes().toString()
    seconds = dateReference.getSeconds().toString().padStart(2, '0')
    return `${minutes}:${seconds}`
}

const clock = document.getElementById('clock')
function timerTick() {
    const reference = Date.now()
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
    window.eventObject = payload
    clockHeader.classList.remove('disconnected')
    updateEvent()
})

function startEvent(e){
    socket.emit('start', {
        start: Date.now(),
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
    btn.disabled = true
    socket.emit('split', {
        runner: parseInt(btn.dataset.runnerindex),
        timestamp: Date.now(),
        split: parseInt(btn.dataset.splitindex)
    })
}

function finishRunner(btn) {
    btn.disabled = true
    socket.emit('finish', {
        runner: parseInt(btn.dataset.runnerindex),
        timestamp: Date.now()
    })
}

socket.on('runner-update', payload => {
    updateRunner(payload)
    window.eventObject.runners[payload.runner_index] = payload
})