function rel(){
    location.reload();
}

async function login(event) {
    event.preventDefault();
    if (document.getElementById("login_input").value.length === 0 || document.getElementById("pass_input").value.length === 0){
        trigger_toast("Заполните логин и пароль!", true)
        return
    }
    let response = await fetch("/token", {
        method: "POST",
        body: new FormData(document.querySelector("form"))
    })
    if (response.status === 401){
        trigger_toast("Не правильный логин или пароль!", true);
    }
    if (response.status === 200){
        let data = await response.json()
        localStorage.setItem('token', data.access_token);
        if (localStorage.getItem("group_hash") !== null && localStorage.getItem("group_id") !== null){
            window.history.pushState({},"", `/groups?create_group=${localStorage.getItem("group_id")}&group_hash=${localStorage.getItem("group_hash")}`);
            rel();
        }
        else {
            window.history.pushState({},"", "/groups");
            rel();
        }
    }
}

function check_inputs(){
    let login = document.getElementById("login_input").value;
    let password = document.getElementById("pass_input").value;
    let confirm = document.getElementById("confirm_pass").value;
    let regularExpressionLogin  = /^[a-zA-Z0-9!@#$%^&*_+={}:;`'"?~|<>-]*$/;
    // let regularExpressionPass  = /^(?=.*[0-9])(?=.*[!@#$%^&*_+={}:;`'"?~|<>-])[a-zA-Z0-9!@#$%^&*_+={}:;`'"?~|<>-]*$/;
    let regularExpressionPass  = /^[a-zA-Z0-9!@#$%^&*_+={}:;`'"?~|<>-]*$/; // simpler pass
    if (login === "" || password === "" || confirm === ""){
        return "Empty";
    }
    if (password.length < 5){
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
    for (let i = 0; i < intext.length; i++) {
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
            trigger_toast("Inputs must not be empty", true);
            return
        }
        else if (checker === "Not same pass"){
            trigger_toast("Пороли не одинаковые", true)
            return
        }
        else if (checker === "Pass len"){
            trigger_toast("Минимальная длина пороля 6 символов", true)
            return
        }
        else if (checker === "Bad pass"){
            trigger_toast("Password should contain at least one number and one special character", true);
            return
        }
        else if (checker === "Bad login"){
            trigger_toast("Bad login: Use only latin letters or may be you use some exotic symbols", true)
            return
        }
        let response = await fetch("/user/register", {
            method: "POST",
            body: new FormData(document.querySelector("form"))
        })
        if (response.status === 426){
            trigger_toast("Данное имя пользователя уже существует", true)
            return;
        }
        if (response.status !== 200) {
            trigger_toast(response.statusText, true)
            return;
        }
        trigger_toast("Успешно!");
        document.getElementById("cancel").click();
        let resp_token = await fetch("/token", {
            method: "POST",
            body: new FormData(document.querySelector("form"))
        })
        if (resp_token.status !== 200) {
            trigger_toast(resp_token.statusText, true);
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
            trigger_toast(group_creation.statusText, true);
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
            trigger_toast("Произошла ошибка при создании карточки инструкции!", true)
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

    var toastElList = [].slice.call(document.querySelectorAll('.toast'))
    var toastList = toastElList.map(function (toastEl) {
      return new bootstrap.Toast(toastEl, {
          delay: 2500
      })
    })

    let intext = document.getElementsByClassName("intext");
    for (let i = 0; i < intext.length; i++){
        intext[i].addEventListener("keypress", function onEvent(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                let enter = document.getElementById("enter")
                if (enter.style.display === "none"){
                    document.getElementById("register_but").click()
                }
                else{
                    enter.click()
                }
            }
        });
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