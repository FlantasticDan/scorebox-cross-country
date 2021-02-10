const navStart = document.getElementById('nav-start')
const navMileOne = document.getElementById('nav-mile-one')
const navMileTwo = document.getElementById('nav-mile-two')
const navFinish = document.getElementById('nav-finish')

const start = document.getElementById('start')
const mileOne = document.getElementById('mile-one')
const mileTwo = document.getElementById('mile-two')
const finish = document.getElementById('finish')

function resetNav() {
    navStart.classList.remove('checked')
    navMileOne.classList.remove('checked')
    navMileTwo.classList.remove('checked')
    navFinish.classList.remove('checked')

    start.classList.add('hide')
    mileOne.classList.add('hide')
    mileTwo.classList.add('hide')
    finish.classList.add('hide')
}

navStart.onclick = () => {
    resetNav()
    navStart.classList.add('checked')
    start.classList.remove('hide')
}

navMileOne.onclick = () => {
    resetNav()
    navMileOne.classList.add('checked')
    mileOne.classList.remove('hide')
}

navMileTwo.onclick = () => {
    resetNav()
    navMileTwo.classList.add('checked')
    mileTwo.classList.remove('hide')
}

navFinish.onclick = () => {
    resetNav()
    navFinish.classList.add('checked')
    finish.classList.remove('hide')
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

let eventObject

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
    if (runner.finsih > 0){
        runnerFinish.disabled = true
    }
}

function updateEvent() {
    eventObject.runners.forEach(runner => updateRunner(runner))
    if (eventObject.start > 0) {
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
    if (eventObject.start > 0) {
        clock.innerText = formatTime(reference - eventObject.start)

        eventObject.runners.forEach(runner => {
            if (runner.mile_one == 0) {
                document.getElementById(`mile-one-clock-${runner.runner_index}`).innerText = formatTime(reference - runner.start)
            }
            else {
                if (runner.mile_two == 0) {
                    document.getElementById(`mile-two-clock-${runner.runner_index}`).innerText = formatTime(reference - runner.mile_one)
                }
                else {
                    if (runner.finish == 0) {
                        document.getElementById(`finish-clock-${runner.runner_index}`).innerText = formatTime(reference - runner.mile_two)
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
    eventObject = payload
    updateEvent()
})

const startBtn = document.getElementById('start-btn')
function startEvent(){
    startBtn.disabled = true
    socket.emit('start', {start: Date.now()})
}

startBtn.onclick = startEvent