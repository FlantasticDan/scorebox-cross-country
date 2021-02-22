const eventForm = document.querySelector('#event-form')
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

        let csv = await eventAthletes.files[0].text()
        payload.append('csv', csv)

        fetch('/init', {
            method: 'POST',
            cache: 'no-cache',
            body: payload
        }).then(res => {
            window.location.href = '/admin'
        })

    }
}

eventForm.onsubmit = SubmitEventForm