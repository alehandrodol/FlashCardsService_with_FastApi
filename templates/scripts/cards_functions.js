function edit_button_behav(){
    let btn_edit = document.getElementById('edit');
    btn_edit.textContent = "Удалить";
    let btn_create = document.getElementById("create");
    btn_create.textContent = "Отмена";
    let a = document.getElementsByTagName("label");
    for (let i = 0; i < a.length; i++) {
        a[i].style.display = "inline-flex";
    }
    btn_create.removeAttribute('data-bs-toggle')
    btn_create.setAttribute("onclick", "rollBack()")
    btn_edit.removeAttribute("onclick");
    btn_edit.setAttribute("onclick", "rollBack2()")
}

function rollBack(){
    let btn_create = document.getElementById("create");
    let btn_edit = document.getElementById('edit');
    btn_edit.textContent = "Редактировать";
    btn_create.textContent = "Создать";
    let a = document.getElementsByTagName("label");
    for (let i = 0; i < a.length; i++) {
        a[i].style.display = "none";
    }
    btn_create.removeAttribute("onclick");
    btn_create.setAttribute('data-bs-toggle', "modal");
    btn_edit.removeAttribute("onclick");
    btn_edit.setAttribute("onclick", "edit_button_behav()")
}

function rollBack2(){
    console.log("Я типа отправляю запрос на удаление карточек ;)")
    rollBack();
}

function createNewCard(){
    let last_card = document.getElementsByClassName("toDelete");
    last_card = last_card[last_card.length-1]
    let new_card = document.createElement("div");
    new_card.setAttribute("class", "check_and_but")
    let object = document.createElement("input");
    object.setAttribute("type", "checkbox");
    object.setAttribute("class", "toDelete");
    let card_id = (Number(last_card.id)+1)
    object.setAttribute("id", card_id.toString())
    new_card.append(object);
    object = document.createElement("label");
    object.setAttribute("for", card_id.toString());
    new_card.append(object);
    object = document.createElement("div");
    if (card_id % 2 === 0){
        object.setAttribute("class", "term_card even_term");
    }
    else{
        object.setAttribute("class", "term_card odd_term");
    }
    let h = document.createElement("h2");
    h.innerText = document.getElementById("front-card").value;
    object.append(h);
    new_card.append(object);
    let cards = document.getElementById("cards_container");
    cards.append(new_card);
    console.log("Типа отправляю запрос на создание карты!")
}

document.addEventListener("DOMContentLoaded", function() {
    let btn_edit = document.querySelector('button[id=edit]');
    btn_edit.setAttribute("onclick", "edit_button_behav()")
});