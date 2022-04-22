function rel(){
    location.reload();
}

async function login(event) {
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
}

document.addEventListener("DOMContentLoaded", async function() {
    if (localStorage.getItem("token") !== null){
        let check_me = await fetch("/user/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
        if (check_me.status === 200) {
            window.history.pushState({}, "", "/groups");
            rel();
        }
        else {
            localStorage.clear()
        }
    }
    let btn = document.querySelector('input[id=enter]');
    btn.addEventListener('click', async function (event) {
        await login(event);
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