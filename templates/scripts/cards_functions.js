function edit_button_behav(){
    let btn_edit = document.getElementById('edit');
    btn_edit.textContent = "Удалить";
    let btn_create = document.getElementById("create");
    btn_create.textContent = "Отмена";
    let a = document.getElementsByClassName("check_label");
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
    let a = document.getElementsByClassName("check_label");
    for (let i = 0; i < a.length; i++) {
        a[i].style.display = "none";
    }
    btn_create.removeAttribute("onclick");
    btn_create.setAttribute('data-bs-toggle', "modal");
    btn_edit.removeAttribute("onclick");
    btn_edit.setAttribute("onclick", "edit_button_behav()")
}

function rollBack2(){
    let checkboxes = document.getElementsByClassName("toDelete");
    let card_list = [];
    let first_id = null;
    for (let i = 0; i < checkboxes.length; i++){
        if (checkboxes[i].checked === true){
            if (first_id === null){
                first_id = checkboxes[i].id;
            }
            let cur_id = checkboxes[i].id;
            card_list.push(cur_id);
        }
    }
    for (let i = 0; i < card_list.length; i++){
        let cur_card = document.getElementById(`card_id_${card_list[i]}`);
        cur_card.remove();
    }

    let cab = document.getElementsByClassName("check_and_but");
    for (let i = first_id - 1; i < cab.length; i++){
        cab[i].setAttribute("id", `card_id_${(i+1).toString()}`);
        cab[i].getElementsByClassName("toDelete")[0].setAttribute("id", `${(i+1).toString()}`)
        cab[i].getElementsByClassName("check_label")[0].setAttribute("for", `${(i+1).toString()}`)
        let term_card = cab[i].getElementsByClassName("term_card")[0];
        let odd_even = "odd_term"
        if ((i+1) % 2 === 0){
            odd_even = "even_term"
        }
        term_card.setAttribute("class", `term_card ${odd_even}`);
    }

    console.log("Я типа отправляю запрос на удаление карточек ;)")
    rollBack();
}

function createNewCard(){
    let last_card = document.getElementsByClassName("toDelete");
    last_card = last_card[last_card.length-1]
    let card_id = -1
    try {
        card_id = (Number(last_card.id)+1)
    }
    catch (e) {
        if (e.name.toString() === "TypeError"){
            card_id = 1
        }
    }

    let new_card = document.createElement("div");
    new_card.setAttribute("class", "check_and_but")
    new_card.setAttribute("id", `card_id_${card_id}`)
    let object = document.createElement("input");
    object.setAttribute("type", "checkbox");
    object.setAttribute("class", "toDelete");
    object.setAttribute("id", card_id.toString())
    new_card.append(object);
    object = document.createElement("label");
    object.setAttribute("for", card_id.toString());
    object.setAttribute("class", "check_label");
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