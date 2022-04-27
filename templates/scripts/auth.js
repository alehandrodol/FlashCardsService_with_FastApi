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

function check_inputs(){
    let login = document.getElementById("login_input").value;
    let password = document.getElementById("pass_input").value;
    let regularExpressionLogin  = /^[a-zA-Z0-9!@#$%^&*_+={}:;`'"?~|<>-]*$/;
    let regularExpressionPass  = /^(?=.*[0-9])(?=.*[!@#$%^&*_+={}:;`'"?~|<>-])[a-zA-Z0-9!@#$%^&*_+={}:;`'"?~|<>-]*$/;
    if (login === "" || password === ""){
        return "Empty";
    }
    if (password.length < 8){
        return "Pass len"
    }
    if (!regularExpressionPass.test(password)){
        return "Bad pass"
    }
    if (!regularExpressionLogin.test(login)){
        return "Bad login"
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
        let checker = check_inputs();
        if (checker === "Empty"){
            alert("Inputs must not be empty");
            return
        }
        else if (checker === "Pass len"){
            alert("Password must be not less than 8 symbols")
            return
        }
        else if (checker === "Bad pass"){
            alert("Password should contain at least one number and one special character");
            return
        }
        else if (checker === "Bad login"){
            alert("Bad login: Use only latin letters or may be you use some exotic symbols")
            return
        }
        let response = await fetch("/user/register", {
            method: "POST",
            body: new FormData(document.querySelector("form"))
        })
        if (response.status === 200)
            alert("Успешно!");
        else if (response.status === 400)
            alert(response.statusText)
        else
            alert("Упс, неизвестная ошибка")
    });
});