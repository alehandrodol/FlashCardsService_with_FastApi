async function main_cards(){
    let response = await fetch("/cards", {
            method: "GET"
        });
        if (response.status === 200){
            document.documentElement.innerHTML = (await ((await response).text())).toString()
            window.history.pushState({},"", "/cards");
            location.reload();
        }
}

async function start_test(){
    let response = await fetch("/testing", {
            method: "GET"
        });
        if (response.status === 200){
            document.documentElement.innerHTML = (await ((await response).text())).toString()
            window.history.pushState({},"", "/testing");
            location.reload();
        }
}

function changeFuncs(){
    let btn_edit = document.getElementById("edit");
    let btn_create = document.getElementById("create");
    let a = document.getElementsByClassName("card_main");
    for (let i = 0; i < a.length; i++) {
        a[i].removeAttribute("data-bs-toggle");
        a[i].setAttribute("onclick", "main_cards()");
    }
    btn_create.removeAttribute("onclick");
    btn_create.setAttribute('data-bs-toggle', "modal");
    btn_edit.textContent = "Редактировать";
    btn_create.textContent = "Создать";
    btn_edit.removeAttribute("onclick");
    btn_edit.setAttribute("onclick", "edit_button_behav()")
}


function editButSecond() {
    console.log("Я типа отправил запросы на изменение ;)");
    changeFuncs();
}


function edit_button_behav(){
    let btn_edit = document.getElementById("edit");
    let btn_create = document.getElementById("create");
    btn_edit.textContent = "Сохранить";
    btn_create.textContent = "Отмена";
    let a = document.getElementsByClassName("card_main");
    for (let i = 0; i < a.length; i++) {
        a[i].removeAttribute("onclick");
        a[i].setAttribute("data-bs-toggle", "modal");
    }

    btn_create.removeAttribute('data-bs-toggle');
    btn_create.setAttribute("onclick", "changeFuncs()")
    btn_edit.removeAttribute("onclick")
    btn_edit.setAttribute("onclick", "editButSecond()")
}

document.addEventListener("DOMContentLoaded", function() {
    let btn_edit = document.querySelector('button[id=edit]');
    btn_edit.setAttribute("onclick", "edit_button_behav()")
});
