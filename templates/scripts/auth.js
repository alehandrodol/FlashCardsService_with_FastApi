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
        if (response.status !== 200) {
            alert(response.statusText)
            return;
        }
        alert("Успешно!");
        document.getElementById("cancel").click();
        let resp_token = await fetch("/token", {
            method: "POST",
            body: new FormData(document.querySelector("form"))
        })
        if (resp_token.status !== 200) {
            alert(resp_token.statusText);
            return
        }
        let data = await resp_token.json();
        let group_creation = await fetch("/group/create_group", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${data.access_token}`
            },
            body: `{"name" : "Я есть инструкция"}`
        });
        if (group_creation.status !== 200){
            alert(group_creation.statusText);
            return
        }
        let card_creation = await fetch("/cards/create_card", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${data.access_token}`
            },
            body: JSON.stringify({
                "front": "Прочитай меня",
                "back": "Я пример того, как будут выглядеть твои карточки",
                "descriptionText": "\tВ данном сервисе ты можешь создавать подобные карточки, а потом тестировать себя," +
                    " и смотреть, как хорошо ты их запомнил! \n\n\tТы можешь: групировать по темам, как тебе это удобно," +
                    " изменять как названия групп, так и всю информацию внутри карточки, ты можешь их удалять " +
                    "с помощью краcной галочки при нажатии кнопки 'редактировать', а потом 'применить', ты можешь делать " +
                    "их активными и неактивными, это делается также как и удаление, только с зелёной галочкой. (В случае" +
                    " когда карта неактивна, она не будет попадаться вам во время тестирования данной группы)\n" +
                    "Если не совсем понятно, давай объясню, представь ты учишь слова по английскому и ты на листочке" +
                    " пишешь слова, а на обратной стороне их перевод, примерно так это и работает. А теперь дополним " +
                    "ситуацию, ещё тебе нужно подготовиться к экзамену по геометрии, и тебе нужно учить определения, теоремы" +
                    " и свойства, пожалуйста, создай новую группу карточек, и пиши там всё про геометрию.\n\tКрайне советуем " +
                    "при создании карточки в поле ответ писать карткий ответ, просто для проверки себя, что вы правильно помните, а" +
                    " уже в поле для описания, писать всю полную информацию, которая лучше поможет вам запонмить нужный ответ.\n\n\t" +
                    "В ближвйшем будущем в описание можно будет добавлять картинки и в целом весь функционал будет расширяться, " +
                    "просто немного терпения ;)\n\nP.S. Стоит отметить важный ньюанс, когда вы повторяете карточки, карточки" +
                    " будут автоматически отключаться, если кол-во 'правильных' повторений неменьше 5 и кол-во 'правильных'" +
                    " повторений неменьше половины от всего кол-ва повторений. В будущем вы сможете изменить данную систему.",
                 "group_id": (JSON.parse(await group_creation.json())).group_id
            })
        });
        if (card_creation.status !== 200){
            alert("Произошла ошибка при создании карточки инструкции!")
        }
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