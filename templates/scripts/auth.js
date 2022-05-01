function rel(){
    location.reload();
}

async function login(event) {
    event.preventDefault();
    let response = await fetch("/token", {
        method: "POST",
        body: new FormData(document.querySelector("form"))
    })
    if (response.status === 401){
        alert("Не правильный логин или пароль!")
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
    let confirm = document.getElementById("confirm_pass").value;
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
    if (password !== confirm){
        return "Not same pass"
    }
    if (!regularExpressionLogin.test(login)){
        return "Bad login"
    }
}

function cancelReg(){
    let enterBut = document.getElementById("enter");
    enterBut.style.display = "block";
    let registerBut = document.getElementById("register_but");
    registerBut.style.display = "none";
    let cancel = document.getElementById("cancel");
    cancel.setAttribute("id", "pseudo_register");
    cancel.innerText = "Регистрация";
    document.getElementById("desc").style.display = "flex";
    document.getElementById("abilities").style.display = "flex";
    let mainTag = document.getElementById("main");
    mainTag.style.justifyContent = "space-between";
    document.getElementById("confirm_pass").style.display = "none";
    document.getElementById("div_register").style.display = "none";
    document.getElementById("auth_form").style.height = "36%";
    let intext = document.getElementsByClassName("intext");
    for (let i = 0; i < intext.length; i++){
        intext[i].style.height = "22%";
    }
    document.getElementsByClassName("formbuts")[0].style.height = "20%";
    cancel.onclick = function (event){
        event.preventDefault();
        startRegister();
    }
}

function startRegister(){
    let enterBut = document.getElementById("enter");
    enterBut.style.display = "none";
    let registerBut = document.getElementById("register_but");
    registerBut.style.display = "block";
    let cancel = document.getElementById("pseudo_register");
    cancel.setAttribute("id", "cancel")
    cancel.innerText = "Отмена";
    document.getElementById("desc").style.display = "none";
    document.getElementById("abilities").style.display = "none";
    let mainTag = document.getElementById("main");
    mainTag.style.justifyContent = "space-around";
    document.getElementById("confirm_pass").style.display = "block";
    document.getElementById("div_register").style.display = "block";
    document.getElementById("auth_form").style.height = "50%";
    let intext = document.getElementsByClassName("intext");
    for (let i = 0; i < intext.length; i++){
        intext[i].style.height = "15%";
    }
    document.getElementsByClassName("formbuts")[0].style.height = "14%";
    cancel.onclick = function (event){
        event.preventDefault();
        cancelReg();
    }
}

async function registration(){
    let checker = check_inputs();
        if (checker === "Empty"){
            alert("Inputs must not be empty");
            return
        }
        else if (checker === "Not same pass"){
            alert("Пороли не одинаковые")
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
        if (response.status === 200) {
            alert("Успешно!");
            document.getElementById("cancel").click();
            let resp_token = await fetch("/token", {
            method: "POST",
            body: new FormData(document.querySelector("form"))
        })
            if (resp_token.status === 200) {
                let data = await resp_token.json();
                let creation = await fetch("/group/create_group", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${data.access_token}`
                    },
                    body: `{"name" : "Я тестовая группа"}`
                });
            }
        }
        else if (response.status === 400)
            alert(response.statusText)
        else
            alert("Упс, неизвестная ошибка")
}

function onload(){
    let pseudo_reg = document.getElementById("pseudo_register");
    pseudo_reg.onclick = function(event) {
        event.preventDefault();
        startRegister();
    }
    let btn = document.querySelector('input[id=enter]');
    btn.addEventListener('click', async function (event) {
        await login(event);
    })
    let btn2 = document.getElementById('register_but');
    btn2.onclick = async function (event){
        event.preventDefault()
        await registration();
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
    onload();
});