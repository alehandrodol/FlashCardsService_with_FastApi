function rel(){
    location.reload();
}

document.addEventListener("DOMContentLoaded", function() {
    let btn = document.querySelector('input[id=enter]');
    btn.addEventListener('click', async function (event) {
        event.preventDefault();
        let response = await fetch("/token", {
            method: "POST",
            body: new FormData(document.querySelector("form"))
        })
        if (response.status === 403){
            let wrong_div = document.querySelector("#WrongUser");
            wrong_div.style.display = "block";
        }
        if (response.status === 200){
            let data = await response.json()
            localStorage.setItem('token', data.access_token);
            window.history.pushState({},"", "/groups");
            rel();
        }
    })
    let btn2 = document.querySelector('input[id=register_but]');
    btn2.addEventListener('click', async function (event) {
        event.preventDefault()
        let response = await fetch("/user/register", {
            method: "POST",
            body: new FormData(document.querySelector("form"))
        })
        if (response.status === 200)
            alert("Успешно!");
        else
            alert("Упс, произошла ошибка")
    });
});