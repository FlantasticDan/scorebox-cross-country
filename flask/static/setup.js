const eventForm = document.querySelector('#event-form')
const eventTitle = document.querySelector('#event-title')
const eventTag = document.querySelector('#event-tag')
const eventAthletes = document.querySelector('#event-athletes')
const eventAthletesLabel = document.querySelector('#event-athletes-label')

function UpdateAthleteLabel() {
    if (eventAthletes.files.length > 0) {
        let filename = eventAthletes.files[0].name
        eventAthletesLabel.innerText = `Selected ${filename}`
    }
    else {
        eventAthletesLabel.innerText = 'Select a File...'
    }
}

eventAthletes.onchange = UpdateAthleteLabel

function ValidateSetup() {
    let valid = true

    if (eventTitle.value.length > 0) {
        eventTitle.labels[0].classList.remove('red')
    }
    else {
        eventTitle.labels[0].classList.add('red')
        valid = false
    }

    if (eventTag.value.length > 0) {
        eventTag.labels[0].classList.remove('red')
    }
    else {
        eventTag.labels[0].classList.add('red')
        valid = false
    }

    if (eventAthletes.value.length > 0) {
        eventAthletes.labels[0].classList.remove('red')
    }
    else {
        eventAthletes.labels[0].classList.add('red')
        valid = false
    }

    return valid

}

async function SubmitEventForm(e) {
    e.preventDefault()

    if (ValidateSetup()) {

        let payload = new FormData()

        payload.append('title', eventTitle.value)
        payload.append('tag', eventTag.value)
        let csv = await eventAthletes.files[0].text()
        payload.append('csv', csv)

        fetch('/init', {
            method: 'POST',
            cache: 'no-cache',
            body: payload
        }).then(res => {
            console.log(res)
            window.location.href = '/timekeeper'
        })

    }
}

eventForm.onsubmit = SubmitEventForm