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