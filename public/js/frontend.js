const schedule = document.querySelector("#schedule")
const now = document.querySelector("#now")
const timeInput = document.querySelector("#timeInput")
const dateInput = document.querySelector("#dateInput")

schedule.addEventListener('click', ()=>{
    timeInput.removeAttribute('disabled')
    dateInput.removeAttribute('disabled')
    timeInput.setAttribute("required", 'true')
    dateInput.setAttribute("required", 'true')
})
now.addEventListener('click', ()=>{
    timeInput.setAttribute("disabled", 'true')
    dateInput.setAttribute("disabled", 'true')
})