async function main_cards(back_id, group_name){
    let response = await fetch(`/cards?group_name=${group_name}`, {
            method: "GET"
        });
        if (response.status === 200){
            localStorage.setItem("group_id", `${back_id.toString()}`)
            document.documentElement.innerHTML = (await ((await response).text())).toString()
            window.history.pushState({},"", `/cards?group_name=${group_name}`);
            rel();
        }
}

async function start_test(){
    let response = await fetch("/testing", {
            method: "GET"
        });
        if (response.status === 200){
            document.documentElement.innerHTML = (await ((await response).text())).toString()
            window.history.pushState({},"", "/testing");
            rel();
        }
}

function changeFuncs(){
    let btn_edit = document.getElementById("edit");
    let btn_create = document.getElementById("create");
    let a = document.getElementsByClassName("card_main");
    for (let i = 0; i < a.length; i++) {
        a[i].removeAttribute("data-bs-toggle");
        let data_id = a[i].parentElement.parentElement.getAttribute("data-id");
        a[i].onclick = function () {main_cards(data_id, a[i].innerText)}
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
        a[i].onclick = function (event) {
            let curID = event.target.parentElement.parentElement.parentElement.id
            localStorage.setItem("currentChangingGroup", `${curID}`);
            let curBackID = event.target.parentElement.parentElement.getAttribute("data-id").toString();
            localStorage.setItem("currentBackGroup", `${curBackID}`);
        }
        a[i].setAttribute("data-bs-toggle", "modal");
    }

    btn_create.removeAttribute('data-bs-toggle');
    btn_create.setAttribute("onclick", "changeFuncs()")
    btn_edit.removeAttribute("onclick")
    btn_edit.setAttribute("onclick", "editButSecond()")
}

async function deleteGroup(event){
    let old_id = ""
    try{
        old_id = event.target.getAttribute("data-id").toString();
    }
    catch (e){
        if (e.name.toString() === "TypeError"){
            old_id = event.target.parentNode.getAttribute("data-id").toString();
        }
    }

    let group_card = document.getElementById(old_id);
    let group_data_id = group_card.getElementsByClassName("group_card")[0].getAttribute("data-id").toString()
    let response = await fetch(`/group/delete_group?group_id=${group_data_id}`, {
        method: "POST",
        headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    if (response.status !== 200){
        return
    }
    group_card.remove();
    let items_list = document.getElementsByClassName("groups_cards");
    if (items_list[items_list.length-1].getElementsByClassName("group_card").length === 0){
        let car_items = document.getElementsByClassName("carousel-item");
        let last_car_item = car_items[car_items.length-1];
        if (last_car_item.getAttribute("class").toString() === "carousel-item active"){
            car_items[0].setAttribute("class", "carousel-item active");
        }
        last_car_item.remove()
    }
    for (let i = Math.floor((Number(old_id)-1) / 4) + 1 ; i < items_list.length; i++){
        let next_group = items_list[i].getElementsByClassName("group_card_container")[0]
        let copy = next_group
        next_group.remove()
        let del_but = copy.getElementsByClassName("delete_card")[0];
        del_but.onclick = function (event) {
            deleteGroup(event);
        }

        items_list[i-1].append(copy)
    }
    if (items_list[items_list.length-1].getElementsByClassName("group_card").length === 0){
        let car_items = document.getElementsByClassName("carousel-item");
        let last_car_item = car_items[car_items.length-1];
        if (last_car_item.getAttribute("class").toString() === "carousel-item active"){
            car_items[0].setAttribute("class", "carousel-item active");
        }
        last_car_item.remove()
    }
    else if (items_list[items_list.length-1].getElementsByClassName("group_card_container").length === 3){
        let new_cont = document.createElement("div");
        let id_for_cont = items_list.length * 4 + 1;
        new_cont.setAttribute("class", "group_card_container");
        new_cont.setAttribute("id", `${id_for_cont.toString()}`)
        items_list[items_list.length-1].append(new_cont)
    }

    let containers_list = document.getElementsByClassName("group_card_container");
    for (let i = old_id-1; i < containers_list.length; i++){
        let new_id = (Number(containers_list[i].getAttribute("id"))-1).toString()
        containers_list[i].setAttribute("id", `${new_id}`)
        if (containers_list[i].getElementsByClassName("card_main").length !== 0){
            let cur_del_but = containers_list[i].getElementsByClassName("delete_card")[0];
            cur_del_but.setAttribute("data-id", `${new_id}`);
            let cur_but = containers_list[i].getElementsByClassName("card_main")[0];
            if (new_id % 2 === 0){
                cur_but.setAttribute("class", "card_main even_card")
            }
            else {
                cur_but.setAttribute("class", "card_main odd_card")
            }
        }
    }
}

function createGroupHTML(inside, new_id, data_id){
    let new_group_card = document.createElement("div");
    new_group_card.setAttribute("class", "group_card");
    new_group_card.setAttribute("data-id", `${data_id}`)

    let object = document.createElement("div");
    object.setAttribute("class", "div_card_main");
    let butt = document.createElement("button");
    let odd_even = ""
    if (new_id % 2 === 0){
        odd_even = "even_card"
    }
    else{
        odd_even = "odd_card"
    }
    butt.setAttribute("class",`card_main ${odd_even} text-truncate`); //TODO make overflow inner text
    butt.onclick = function () {main_cards(data_id, inside)}
    butt.setAttribute("data-bs-target", "#changeGroup");
    butt.innerText = inside;
    object.append(butt);
    new_group_card.append(object)


    object = document.createElement("div")
    object.setAttribute("class", "card_buttons")

    butt = document.createElement("div");
    butt.setAttribute("class", "delete_card card_but");
    butt.setAttribute("data-id", `${new_id.toString()}`)
    butt.onclick = function (event) {
            deleteGroup(event);
    }
    let icon = document.createElement("i")
    icon.setAttribute("class", "bi bi-x-lg")
    butt.append(icon)
    object.append(butt)

    butt = document.createElement("div");
    butt.setAttribute("class", "test_card card_but text-white");
    butt.setAttribute("onclick", "start_test()");
    icon = document.createElement("i")
    icon.setAttribute("class", "bi bi-play-fill");
    butt.append(icon)
    object.append(butt)
    new_group_card.append(object);
    return new_group_card
}

async function createGroup(){
    let text = document.getElementById("recipient-name").value.toString();
    let response = await fetch("/group/create_group", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: `{"name" : "${text}"}`
    });
    let data = JSON.parse(await response.json())
    let list_cards = document.getElementsByClassName("group_card");    let new_id = list_cards.length + 1;
    let carItem = document.getElementsByClassName("carousel-item");
    carItem = carItem[carItem.length-1];
    if (list_cards.length % 4 === 0){
        carItem = createCarouselItem(list_cards.length+1);
    }

    let new_group_card = createGroupHTML(text, new_id, data.group_id)
    let container = carItem.getElementsByClassName("group_card_container");
    container[(new_id-1) % 4].append(new_group_card)
}

function createCarouselItem(id_start){
    let new_item = document.createElement("div");
    if (document.getElementsByClassName("carousel-item").length === 0){
        new_item.setAttribute("class", "carousel-item active");
    }
    else {
        new_item.setAttribute("class", "carousel-item");
    }
    let cards = document.createElement("div")
    cards.setAttribute("class", "groups_cards d-flex");
    for (let i = 0; i < 4; i++){
        let container = document.createElement("div");
        container.setAttribute("class", "group_card_container");
        container.setAttribute("id", `${(id_start + i).toString()}`)
        cards.append(container);
    }
    new_item.append(cards)
    let carousel = document.getElementById("innerCar");
    carousel.append(new_item);
    return new_item
}

async function changeNameGroup(){
    let text = document.getElementById("new-group-name").value
    let response = await fetch(`/group/edit_group?group_id=${localStorage.getItem("currentBackGroup")}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({"name": text})
    })
    if (response.status === 200){
        let curGroup = document.getElementById(`${localStorage.getItem("currentChangingGroup")}`)
        curGroup.firstChild.firstChild.firstChild.innerText = text
    }
}

function onload_groups(){
    let btn_edit = document.querySelector('button[id=edit]');
    btn_edit.setAttribute("onclick", "edit_button_behav()")

    let myMod = document.getElementById("myModal");
    let createGroupBut = myMod.getElementsByClassName("approve");
    createGroupBut = createGroupBut[createGroupBut.length-1];
    createGroupBut.setAttribute("onclick", "createGroup()");

    let changeGroupMod = document.getElementById("changeGroup");
    let changeNameBut = changeGroupMod.getElementsByClassName("approve");
    changeNameBut = changeNameBut[0]
    changeNameBut.onclick = async function (){
        await changeNameGroup()
    }

    let delete_buts = document.getElementsByClassName("delete_card")
    for (let i = 0; i < delete_buts.length; i++){
        delete_buts[i].onclick = function (event) {
            deleteGroup(event);
        }
    }
}

async function group_content(){
    let groups_data = (await fetch("/group/groups", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }))
    if (groups_data.status === 200){
        groups_data = JSON.parse((await groups_data.text()).toString())

        let inner = document.getElementById("innerCar");
        let car_item = document.createElement("div")
        for (let i = 0; i < groups_data.length; i++){
            if (i % 4 === 0){
                if (i !== 0){
                    inner.append(car_item);
                }
                car_item = createCarouselItem(i+1);
            }
            let group_card = createGroupHTML(groups_data[i]["name"], i+1, groups_data[i]["id"]);
            let cont = car_item.getElementsByClassName("group_card_container")[i % 4];
            cont.append(group_card);
        }
        inner.append(car_item);
        onload_groups();


    }
}

document.addEventListener("DOMContentLoaded", async function() {
    await group_content();
});