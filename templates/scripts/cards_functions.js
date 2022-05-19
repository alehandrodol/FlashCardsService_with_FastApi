function edit_button_behav(){
    let btn_edit = document.getElementById('edit');
    btn_edit.textContent = "Применить";
    let btn_create = document.getElementById("create");
    btn_create.textContent = "Отмена";
    let a = document.getElementsByClassName("check_and_but");
    for (let i = 0; i < a.length; i++) {
        a[i].children[1].style.display = "inline-flex";
        a[i].children[3].style.display = "inline-flex";
        a[i].children[4].setAttribute("data-bs-target", "#myModal")
        a[i].children[4].onclick = async function (event) {
            let card_back_id = event.target.parentElement.getAttribute("data-id")
            if (card_back_id === null){
                card_back_id = event.target.parentElement.parentElement.getAttribute("data-id")
            }
            localStorage.setItem("curBackIdCard", card_back_id);
            localStorage.setItem("curFrontIdCard", a[i].children[0].getAttribute("data-id"))
            await cardFiller(card_back_id, "myModal");
        }
    }

    let cardMod = document.getElementById("myModal");
    let appr_but = cardMod.getElementsByClassName("approve")[0];
    appr_but.innerText = "Сохранить";
    appr_but.onclick = async function () {
        await editCard();
    }

    btn_create.removeAttribute("onclick");
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
    let a = document.getElementsByClassName("check_and_but");
    for (let i = 0; i < a.length; i++) {
        a[i].children[0].checked = false;
        a[i].children[1].style.display = "none";
        a[i].children[3].style.display = "none";
        a[i].children[4].setAttribute("data-bs-target", "#cardModal")
        a[i].children[4].onclick = async function (event) {
            let card_back_id = event.target.parentElement.getAttribute("data-id")
            if (card_back_id === null){
                card_back_id = event.target.parentElement.parentElement.getAttribute("data-id")
            }
            await cardFiller(card_back_id, "cardModal");
        }
    }

    let cardMod = document.getElementById("myModal");
    let appr_but = cardMod.getElementsByClassName("approve")[0];
    appr_but.innerText = "Создать";
    appr_but.onclick = async function () {
        await createNewCard();
    }
    localStorage.removeItem("curFrontIdCard");
    localStorage.removeItem("curBackIdCard");
    btn_create.removeAttribute("onclick");
    btn_create.setAttribute('data-bs-toggle', "modal");
    btn_create.onclick = function() {
        let myMod = document.getElementById("myModal");
        let modInputs = myMod.getElementsByClassName("form-control");
        modInputs[0].value = "";
        modInputs[1].value = "";
        modInputs[2].innerText = "";
    }

    btn_edit.removeAttribute("onclick");
    btn_edit.setAttribute("onclick", "edit_button_behav()")
    rel();
}

async function rollBack2(){
    let checkboxes = document.getElementsByClassName("toDelete");
    let card_list = [];
    let back_id_list = [];
    let first_id = null;
    for (let i = 0; i < checkboxes.length; i++){
        if (checkboxes[i].checked === true){
            if (first_id === null){
                first_id = checkboxes[i].getAttribute("data-id");
            }
            let cur_id = checkboxes[i].getAttribute("data-id");
            card_list.push(cur_id);
            back_id_list.push(checkboxes[i].parentElement.getAttribute("data-id"));
        }
    }
    for (let i = 0; i < card_list.length; i++){
        let cur_card = document.getElementById(`card_id_${card_list[i]}`);
        cur_card.remove();
    }

    let cab = document.getElementsByClassName("check_and_but");
    if (first_id !== null){
        for (let i = first_id - 1; i < cab.length; i++){
            cab[i].setAttribute("id", `card_id_${(i+1).toString()}`);
            cab[i].getElementsByClassName("toDelete")[0].setAttribute("id", `delete_id_${(i+1).toString()}`)
            cab[i].getElementsByClassName("check_label")[0].setAttribute("for", `delete_id_${(i+1).toString()}`)
            cab[i].getElementsByClassName("toActivate")[0].setAttribute("id", `activate_id_${(i+1).toString()}`)
            cab[i].getElementsByClassName("check_label")[1].setAttribute("for", `activate_id_${(i+1).toString()}`)
            let term_card = cab[i].getElementsByClassName("term_card")[0];
            let odd_even = "odd_term"
            if ((i+1) % 2 === 0){
                odd_even = "even_term"
            }
            term_card.setAttribute("class", `term_card ${odd_even}`);
        }
        let response = await fetch("cards/delete_cards", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(back_id_list)
        })
    }
    checkboxes = document.getElementsByClassName("toActivate");
    let group_id = localStorage.getItem("group_id");
    let not_active_cards = await fetch(`/cards/active_or_not_cards/${group_id}?is_active=false`, {
        method: "GET",
        headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    let list_for_activating = [];
    let list_for_deactivating = [];
    not_active_cards = JSON.parse((await not_active_cards.text()).toString())
    for (let i = 0; i < checkboxes.length; i++){
        let cur_card_id = checkboxes[i].parentElement.getAttribute("data-id");
        if (checkboxes[i].checked === true && not_active_cards.indexOf(Number(cur_card_id)) !== -1){
            list_for_activating.push(cur_card_id);
        }
        else if (checkboxes[i].checked === false && not_active_cards.indexOf(Number(cur_card_id)) === -1){
            list_for_deactivating.push(cur_card_id);
        }
    }
    if (list_for_activating.length !== 0){
        let act_resp = await fetch("cards/activate", {
            method: "POST",
            headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(list_for_activating)
        })
        if (act_resp.status === 200){
            console.log("Карты активированны");
        }
    }

    if (list_for_deactivating.length !== 0){
        let deact_resp = await fetch("cards/deactivate", {
            method: "POST",
            headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(list_for_deactivating)
        })
        if (deact_resp.status === 200){
            console.log("Карты деактивированны");
        }
    }
    rollBack();
}

function createCardHTML(card_id, text, is_active){
    let new_card = document.createElement("div");
    new_card.setAttribute("class", "check_and_but")
    new_card.setAttribute("id", `card_id_${card_id}`)

    let object = document.createElement("input");
    object.setAttribute("type", "checkbox");
    object.setAttribute("class", "toDelete check");
    object.setAttribute("id", `delete_id_${card_id.toString()}`)
    object.setAttribute("data-id", card_id.toString());
    new_card.append(object);
    object = document.createElement("label");
    object.setAttribute("for", `delete_id_${card_id.toString()}`);
    object.setAttribute("class", "check_label");
    new_card.append(object);

    object = document.createElement("input");
    object.setAttribute("type", "checkbox");
    object.setAttribute("class", "toActivate check");
    object.setAttribute("id", `activate_id_${card_id.toString()}`)
    object.setAttribute("data-id", card_id.toString());
    if (is_active){
        object.checked = true;
    }
    new_card.append(object);
    object = document.createElement("label");
    object.setAttribute("for", `activate_id_${card_id.toString()}`);
    object.setAttribute("class", "check_label");
    new_card.append(object);

    object = document.createElement("div");
    object.onclick = async function (event) {
        let card_back_id = event.target.parentElement.getAttribute("data-id")
        if (card_back_id === null){
            card_back_id = event.target.parentElement.parentElement.getAttribute("data-id")
        }
        await cardFiller(card_back_id, "cardModal");
    }
    object.setAttribute("data-bs-target", "#cardModal");
    object.setAttribute("data-bs-toggle", "modal")
    if (!is_active) {
        object.setAttribute("class", "term_card off_card");
    }
    else if (card_id % 2 === 0){
        object.setAttribute("class", "term_card even_term");
    }
    else{
        object.setAttribute("class", "term_card odd_term");
    }
    let h = document.createElement("h2");
    h.innerText = text;
    object.append(h);
    new_card.append(object);
    return new_card
}

async function editCard(){
    let cardMod = document.getElementById("myModal");
    let front = cardMod.getElementsByClassName("front_card")[0].value;
    let back = cardMod.getElementsByClassName("back_card")[0].value;
    let description = document.getElementById("tipaTextArea").innerText;
    let cardId = localStorage.getItem("curBackIdCard");
    let response = await fetch(`cards/edit_card?card_id=${cardId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            "front": front,
            "back": back,
            "descriptionText": description,
        })
    });
    if (response.status === 200){
        let label = document.getElementById(`card_id_${localStorage.getItem("curFrontIdCard")}`);
        label.children[4].children[0].innerText = front;
    }
}

async function createNewCard(){
    let last_card = document.getElementsByClassName("toDelete");
    last_card = last_card[last_card.length-1]
    let card_id = -1
    try {
        card_id = (Number(last_card.getAttribute("data-id"))+1)
    }
    catch (e) {
        if (e.name.toString() === "TypeError"){
            card_id = 1
        }
    }
    let front_text = document.getElementById("front-card").value;
    let back_text = document.getElementById("back-card").value;
    let description = document.getElementById("tipaTextArea").innerText;

    let response = await fetch("/cards/create_card", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            "front": front_text,
            "back": back_text,
            "descriptionText": description,
            "group_id": localStorage.getItem("group_id")
        })
    })
    if (response.status === 200){
        let resp_data = JSON.parse(await response.json())
        let new_card = createCardHTML(card_id, front_text, resp_data.active);
        new_card.setAttribute("data-id", resp_data.card_id)
        let cards = document.getElementById("cards_container");
        cards.append(new_card);
    }
}

async function cards_data(group_id){
    let response = (await fetch(`/group/cards_in/${group_id.toString()}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }))
    if (response.status === 200){
        let list_cards = JSON.parse((await response.text()).toString())
        let cont = document.getElementById("cards_container");
        for (let i = 0; i < list_cards.length; i++){
            let new_card = createCardHTML(i+1, list_cards[i].front, list_cards[i].active);
            new_card.setAttribute("data-id", `${list_cards[i].id}`)
            cont.append(new_card);
        }
        onload_cards();
    }
}

async function search_data(){
    let response = (await fetch(`/cards/find_by_string?string=${document.getElementById("page_name").innerText}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }))
    if (response.status === 200){
        let search_data = JSON.parse((await response.text()).toString())
        let cont = document.getElementById("cards_container");
        let card_id_to_group_name = {}
        for (let i = search_data.length-1; i >= 0; i--){
            let cur_card = search_data[i][0];
            card_id_to_group_name[cur_card.id.toString()] = search_data[i][2];
            let new_card = createCardHTML((search_data.length-1 - i), cur_card.front, cur_card.active);
            new_card.setAttribute("data-id", `${cur_card.id}`)
            cont.append(new_card);
        }
        localStorage.setItem("id_to_name", JSON.stringify(card_id_to_group_name));
        onload_cards();
    }
}

function onload_cards(){
    localStorage.removeItem("group_name");
    let btn_edit = document.querySelector('button[id=edit]');
    btn_edit.setAttribute("onclick", "edit_button_behav()")
    let myMod = document.getElementById("myModal");
    let modInputs = myMod.getElementsByClassName("form-control");
    modInputs[0].addEventListener("keypress", function onEvent(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            modInputs[1].focus();
        }
    });
    modInputs[1].addEventListener("keypress", function onEvent(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            modInputs[2].focus();
        }
    });
    let btn_create = document.getElementById("create");
    btn_create.onclick = function() {
        let myMod = document.getElementById("myModal");
        let modInputs = myMod.getElementsByClassName("form-control");
        modInputs[0].value = "";
        modInputs[1].value = "";
        modInputs[2].innerText = "";
    }
    myMod.addEventListener("keypress", function onEvent(event) {
        if (event.key === "Enter" && document.activeElement === myMod) {
            event.preventDefault();
            document.getElementsByClassName("approve2")[0].click();
        }
    });

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    bind_searchBut();
}

document.addEventListener("DOMContentLoaded", async function() {
    if (window.location.href.includes("/cards")){
        let cur_id = localStorage.getItem("group_id");
        await cards_data(cur_id);
    }
    else if (window.location.href.includes("/search?")){
        document.getElementsByClassName("group_buttons")[0].style.display = "none";
        document.getElementById("cards_container").style.height = "90%";
        document.getElementById("main_cards").style.height = "75vh";
        await search_data()
    }
});