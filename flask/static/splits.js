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
    const reference = Date.now()
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
