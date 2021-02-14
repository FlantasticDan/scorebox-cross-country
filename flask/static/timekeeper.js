const navStart = document.getElementById('nav-start')
const navSplits = document.getElementsByClassName('nav-splits')
const navFinish = document.getElementById('nav-finish')

const start = document.getElementById('start')
const splitGrids = document.getElementsByClassName('split-grid')
const finish = document.getElementById('finish')

function resetNav() {
    navStart.classList.remove('checked')
    Array.from(navSplits).forEach(splitBtn => splitBtn.classList.remove('checked'))
    navFinish.classList.remove('checked')

    start.classList.add('hide')
    Array.from(splitGrids).forEach(splitGrid => splitGrid.classList.add('hide'))
    finish.classList.add('hide')
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
     const runnerMileOne = document.getElementById(`mile-one-btn-${runner.runner_index}`)
     const runnerMileTwo = document.getElementById(`mile-two-btn-${runner.runner_index}`)
     const runnerFinish = document.getElementById(`finish-btn-${runner.runner_index}`)

    if (runner.start > 0) {
        runnerMileOne.disabled = false
    }
    if (runner.mile_one > 0) {
        runnerMileOne.disabled = true
        runnerMileTwo.disabled = false
    }
    if (runner.mile_two > 0) {
        runnerMileTwo.disabled = true
        runnerFinish.disabled = false
    }
    if (runner.finish > 0){
        runnerFinish.disabled = true
    }
}

function updateEvent() {
    window.eventObject.runners.forEach(runner => updateRunner(runner))
    if (window.eventObject.start > 0) {
        startBtn.disabled = true
    }
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
            if (runner.mile_one == 0 && runner.mile_two == 0) {
                document.getElementById(`mile-one-clock-${runner.runner_index}`).innerText = formatTime(reference - runner.start)
            }
            else {
                document.getElementById(`mile-one-clock-${runner.runner_index}`).innerText = formatTime(runner.mile_one - runner.start)
                if (runner.mile_two == 0 && runner.finish == 0) {
                    document.getElementById(`mile-two-clock-${runner.runner_index}`).innerText = formatTime(reference - runner.mile_one)
                }
                else {
                    document.getElementById(`mile-two-clock-${runner.runner_index}`).innerText = formatTime(runner.mile_two - runner.mile_one)
                    if (runner.finish == 0) {
                        document.getElementById(`finish-clock-${runner.runner_index}`).innerText = formatTime(reference - runner.mile_two)
                    }
                    else{
                        document.getElementById(`finish-clock-${runner.runner_index}`).innerText = formatTime(runner.finish - runner.start)
                    }
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

socket.on('event-reset', payload => {
    window.eventObject = payload
    updateEvent()
})

const startBtn = document.getElementById('start-btn')
function startEvent(){
    startBtn.disabled = true
    socket.emit('start', {start: Date.now()})
}

startBtn.onclick = startEvent

function splitMileOne(btn) {
    btn.disabled = true
    socket.emit('mile-one', {
        runner: parseInt(btn.dataset.runnerindex),
        timestamp: Date.now()
    })
}

function splitMileTwo(btn) {
    btn.disabled = true
    socket.emit('mile-two', {
        runner: parseInt(btn.dataset.runnerindex),
        timestamp: Date.now()
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