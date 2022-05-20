async function main_cards(back_id, group_name){
    let response = await fetch(`/cards?group_name=${group_name}`, {
            method: "GET"
        });
        if (response.status === 200){
            localStorage.setItem("group_id", `${back_id.toString()}`)
            let group_num = document.querySelector(`div[data-id="${back_id}"]`).parentElement.getAttribute("id")
            localStorage.setItem("car_ind", Math.floor((Number(group_num)-1) / 4).toString())
            document.documentElement.innerHTML = (await ((await response).text())).toString()
            window.history.pushState({},"", `/cards?group_name=${group_name}`);
            rel();
        }
}

async function start_test(event){
    let group_card = event.target.parentElement.parentElement.parentElement;
    if (group_card.getAttribute("data-id") === null){
        group_card = event.target.parentElement.parentElement;
    }
    let group_id = group_card.getAttribute("data-id");
    localStorage.setItem("group_id", group_id);
    let group_name = group_card.getElementsByClassName("cardMainSpan")[0].innerText;

    let try_resp = await fetch(`/cards/active_or_not_cards/${group_id}?is_active=true`, {
        method: "GET",
        headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    let active_cards_list = JSON.parse((await try_resp.text()).toString())
    if (active_cards_list.length === 0){
        trigger_toast("У вас нету карт в данной группе или ни одна из них неактивна", true)
        return
    }

    let response = await fetch(`/testing?group_name=${group_name}`, {
            method: "GET"
        });
        if (response.status === 200){
            document.documentElement.innerHTML = (await ((await response).text())).toString()
            window.history.pushState({},"", `/testing?group_name=${group_name}`);
            rel();
        }
}

function changeFuncs(){
    let btn_edit = document.getElementById("edit");
    let btn_create = document.getElementById("create");
    let a = document.getElementsByClassName("card_main");
    for (let i = 0; i < a.length; i++) {
        a[i].style.outline = "0";
        a[i].removeAttribute("data-bs-toggle");
        let data_id = a[i].parentElement.parentElement.getAttribute("data-id");
        a[i].onclick = function () {main_cards(data_id, a[i].innerText)}
    }

    let changed_list = localStorage.getItem("changed_list");
    if (changed_list !== null){
        changed_list = JSON.parse(changed_list);
        for (let i = 0; i < changed_list.length; i++){
            let container = document.getElementById(changed_list[i]["frontId"]);
            container.firstChild.firstChild.firstChild.firstChild.lastChild.innerText = changed_list[i]["old_name"];
        }
    }
    localStorage.removeItem("changed_list");

    localStorage.removeItem("currentBackGroup");
    localStorage.removeItem("currentChangingGroup");
    btn_create.removeAttribute("onclick");
    btn_create.setAttribute('data-bs-toggle', "modal");
    btn_create.onclick = function() {
        let myMod = document.getElementById("myModal");
        let modInputs = myMod.getElementsByClassName("form-control");
        modInputs[0].value = "";
    }
    btn_edit.textContent = "Редактировать";
    btn_create.textContent = "Создать";
    btn_edit.removeAttribute("onclick");
    btn_edit.setAttribute("onclick", "edit_button_behav()")
}


async function editButSecond() {
    let changed_list = JSON.parse(localStorage.getItem("changed_list"));
    if (changed_list === null){
        changed_list = [];
    }
    for (let i = 0; i < changed_list.length; i++){
        if (changed_list[i]["old_name"] !== changed_list[i]["new_name"] && changed_list[i]["new_name"] !== undefined){
            let response = await fetch(`/group/edit_group?group_id=${changed_list[i]["backId"]}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({"name": changed_list[i]["new_name"]})
            })
            if (response.status === 200) {
                trigger_toast("Успешно")
            }
            else if (response.status === 426){
                trigger_toast("Название группы не должно быть пустое!", true)
            }
            else if (response.status === 400){
                trigger_toast("Извините, кажется вы использовали какие-то неподдерживаемые символы", true)
            }
        }
    }
    localStorage.removeItem("changed_list");
    changeFuncs();
}


function edit_button_behav(){
    localStorage.removeItem("changed_list");
    let btn_edit = document.getElementById("edit");
    let btn_create = document.getElementById("create");
    btn_edit.textContent = "Сохранить";
    btn_create.textContent = "Отмена";
    let a = document.getElementsByClassName("card_main");
    for (let i = 0; i < a.length; i++) {
        a[i].onclick = function (event) {
            let curID = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.id; // .group_card_container.id from div (.cardMainSpan)
            if (curID === ""){
                curID = event.target.parentElement.parentElement.parentElement.id; // .group_card_container.id from button (.card_main)
            }

            let old_name = event.target.innerText;

            let curBackID = "";
            try {
                curBackID = event.target.parentElement.parentElement.parentElement.parentElement.getAttribute("data-id").toString(); // .group_card.data-id from div (.cardMainSpan)
            }
            catch (e) {
                if (e.name.toString() === "TypeError"){
                    curBackID = event.target.parentElement.parentElement.getAttribute("data-id").toString(); // .group_card.data-id from button (.card_main)
                }
            }

            let changed_list = JSON.parse(localStorage.getItem("changed_list"));
            if (changed_list === null){
                 changed_list = [];
            }
            let changed_group = {"backId": curBackID, "frontId": curID, "old_name": old_name};
            changed_list.push(changed_group);
            localStorage.setItem("changed_list", JSON.stringify(changed_list));

            let modal = document.getElementById("changeGroup");
            let input = modal.getElementsByClassName("form-control")[0];
            input.value = old_name;
        }
        a[i].style.outline = "3px solid #EF9452";
        a[i].setAttribute("data-bs-toggle", "modal");
    }

    btn_create.removeAttribute("onclick");
    btn_create.removeAttribute('data-bs-toggle');
    btn_create.setAttribute("onclick", "changeFuncs()")
    btn_edit.removeAttribute("onclick")
    btn_edit.setAttribute("onclick", "editButSecond()")
}

function changeNameGroup(){
    let text = document.getElementById("new-group-name").value
    let changed_list = JSON.parse(localStorage.getItem("changed_list"));
    let cur_ind = changed_list.length-1;
    let front_id = changed_list[cur_ind]["frontId"]
    if (text.length === 0){
        trigger_toast("Название группы не должно быть пустое!", true)
        return
    }
    for (let i = 0; i < changed_list.length; i++){
        if (changed_list[i]["frontId"] === front_id){
            if (cur_ind !== i){
                cur_ind = i
                changed_list.pop()
            }
            break
        }
    }
    changed_list[cur_ind]["new_name"] = text;
    localStorage.setItem("changed_list", JSON.stringify(changed_list));
    let curGroup = document.getElementById(`${front_id}`)
    curGroup.firstChild.firstChild.firstChild.firstChild.lastChild.innerText = text
}

async function deleteGroup(){
    let old_id = localStorage.getItem("GroupToDelete");

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
    localStorage.removeItem("GroupToDelete");
    let items_list = document.getElementsByClassName("groups_cards");
    if (items_list[items_list.length-1].getElementsByClassName("group_card").length === 0){
        let car_items = document.getElementsByClassName("carousel-item");
        let last_car_item = car_items[car_items.length-1];
        let indicators = document.getElementsByClassName("car_ind");
        if (last_car_item.getAttribute("class").toString() === "carousel-item active"){
            car_items[car_items.length - 2].setAttribute("class", "carousel-item active");
            indicators[indicators.length - 2].setAttribute("class", "car_ind active")
        }
        last_car_item.remove()
        indicators[indicators.length - 1].remove()

    }
    for (let i = Math.floor((Number(old_id)-1) / 4) + 1 ; i < items_list.length; i++){
        let next_group = items_list[i].getElementsByClassName("group_card_container")[0]
        let copy = next_group
        next_group.remove()

        items_list[i-1].append(copy)
    }
    let len = -1;
    try {
        len = items_list[items_list.length-1].getElementsByClassName("group_card").length
    }
    catch (e) {
        if (e.name.toString() === "TypeError"){
            return
        }
    }
    if (len === 0){
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
    butt.setAttribute("class",`card_main ${odd_even}`);
    butt.onclick = function () {main_cards(data_id, inside)}
    butt.setAttribute("data-bs-target", "#changeGroup");

    let div_with_relative = document.createElement("div");
    div_with_relative.setAttribute("class", "relative_inside_group");
    let div_with_ico = document.createElement("div");
    div_with_ico.setAttribute("class", "div_share");
    div_with_ico.onclick = async function (event){
        event.stopPropagation()
        event.preventDefault()
        await shareGroup(event)
        trigger_toast("Ссылка скопирована")
    }
    let share_ico = document.createElement("i");
    share_ico.setAttribute("class", "bi bi-box-arrow-up")
    div_with_ico.append(share_ico)
    div_with_relative.append(div_with_ico)

    let mySpan = document.createElement("div");
    mySpan.setAttribute("class", "cardMainSpan text-break");
    mySpan.innerText = inside;
    div_with_relative.append(mySpan);
    butt.append(div_with_relative);
    object.append(butt);
    new_group_card.append(object)


    object = document.createElement("div")
    object.setAttribute("class", "card_buttons")

    butt = document.createElement("div");
    butt.setAttribute("class", "delete_card card_but");
    butt.setAttribute("data-id", `${new_id.toString()}`);
    butt.setAttribute("data-bs-target", "#approveModal");
    butt.setAttribute("data-bs-toggle", "modal");
    butt.onclick = async function (event) {
        await onClickDelete(event);
    }
    let icon = document.createElement("i")
    icon.setAttribute("class", "bi bi-x-lg")
    butt.append(icon)
    object.append(butt)

    butt = document.createElement("div");
    butt.setAttribute("class", "test_card card_but text-white");
    butt.onclick = async function(event) {
        await start_test(event);
    }
    icon = document.createElement("i")
    icon.setAttribute("class", "bi bi-play-fill");
    butt.append(icon)
    object.append(butt)
    new_group_card.append(object);
    return new_group_card
}

async function createGroup(){
    let text = document.getElementById("recipient-name").value.toString();
    if (text.length === 0){
        trigger_toast("Название группы не должно быть пустое!", true)
        return
    }
    let response = await fetch("/group/create_group", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: `{"name" : "${text}"}`
    });
    if (response.status !== 200){
        trigger_toast(`Status: ${response.status}, Status text: ${response.statusText}`)
        return
    }
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
    let active_ind = Number(localStorage.getItem("car_ind"));
    let carousel = document.getElementById("innerCar");

    let car_indicator = document.createElement("button")
    car_indicator.setAttribute("type", "button")
    car_indicator.setAttribute("data-bs-target", "#carouselWithCards")
    let slide_num = carousel.getElementsByClassName("carousel-item").length;
    car_indicator.setAttribute("data-bs-slide-to", slide_num.toString())
    car_indicator.setAttribute("aria-label", `Slide ${slide_num + 1}`)
    car_indicator.setAttribute("class", "car_ind")

    if (document.getElementsByClassName("carousel-item").length === active_ind){
        new_item.setAttribute("class", "carousel-item active");
        car_indicator.setAttribute("class", "car_ind active")
        car_indicator.setAttribute("aria-current", "true")
        localStorage.removeItem("car_ind")
    }
    else {
        new_item.setAttribute("class", "carousel-item");
    }

    let indicators = document.getElementsByClassName("carousel-indicators")[0];
    indicators.append(car_indicator);

    let cards = document.createElement("div")
    cards.setAttribute("class", "groups_cards d-flex");
    for (let i = 0; i < 4; i++){
        let container = document.createElement("div");
        container.setAttribute("class", "group_card_container");
        container.setAttribute("id", `${(id_start + i).toString()}`)
        cards.append(container);
    }
    new_item.append(cards)
    carousel.append(new_item);

    return new_item
}

async function onClickDelete(event) {
    let old_id = ""
    try{
        old_id = event.target.getAttribute("data-id").toString();
    }
    catch (e){
        if (e.name.toString() === "TypeError"){
            old_id = event.target.parentNode.getAttribute("data-id").toString();
        }
    }
    localStorage.setItem("GroupToDelete", old_id);
}

async function shareGroup(event){
    let back_id;
    try {
        back_id = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute("data-id").toString(); // .group_card.data-id from i (.bi bi-box-arrow-up)
    }
    catch (e) {
        if (e.name.toString() === "TypeError"){
            back_id = event.target.parentElement.parentElement.parentElement.parentElement.getAttribute("data-id").toString(); // .group_card.data-id from div (.div_share)
        }
    }
    let response = await fetch(`/group/make_share_hash?group_id=${back_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });
    if (response.status === 200) {
        let data = JSON.parse(await response.json())
        await navigator.clipboard.writeText(`http://127.0.0.1:8000/groups?create_group=${back_id}&group_hash=${data.share_hash}`)
    }
}

async function copy_group_confirm(){
    let response = await fetch(`/group/copy_group?group_id=${localStorage.getItem("group_id")}&string_confirm=${localStorage.getItem("group_hash")}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });
    if (response.status === 200){
        localStorage.removeItem("group_hash")
        localStorage.removeItem("group_id")
        window.history.pushState({},"", "/groups");
        rel();
    }
    else if (response.status === 400) {
        localStorage.removeItem("group_hash")
        localStorage.removeItem("group_id")
        window.history.pushState({},"", "/groups");
        trigger_toast("sorry, something went wrong :(", true)
    }
}

function onload_groups(){
    let btn_edit = document.querySelector('button[id=edit]');
    btn_edit.setAttribute("onclick", "edit_button_behav()")

    let myMod = document.getElementById("myModal");
    let createGroupBut = myMod.getElementsByClassName("approve");
    createGroupBut = createGroupBut[createGroupBut.length-1];
    createGroupBut.setAttribute("onclick", "createGroup()");
    let inputName = myMod.getElementsByClassName("form-control")[0];
    inputName.addEventListener("keypress", function onEvent(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            createGroupBut.click();
        }
    });

    let changeGroupMod = document.getElementById("changeGroup");
    let changeNameBut = changeGroupMod.getElementsByClassName("approve");
    changeNameBut = changeNameBut[0]
    changeNameBut.onclick = async function (){
        await changeNameGroup()
    }

    inputName = changeGroupMod.getElementsByClassName("form-control")[0];
    inputName.addEventListener("keypress", function onEvent(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            changeNameBut.click();
        }
    });

    let approve_but = document.getElementById("approveModal").getElementsByClassName("approve")[0];
    approve_but.onclick = async function() {
        await deleteGroup()
    }

    let btn_create = document.getElementById("create");
    btn_create.onclick = function() {
        let myMod = document.getElementById("myModal");
        let modInputs = myMod.getElementsByClassName("form-control");
        modInputs[0].value = "";
    }

    var toastElList = [].slice.call(document.querySelectorAll('.toast'))
    var toastList = toastElList.map(function (toastEl) {
      return new bootstrap.Toast(toastEl, {
          delay: 2500
      })
    })

    bind_searchBut();
    let copyModal = document.getElementById("approveCopyModal")
    if (copyModal !== null){
        var myModal = new bootstrap.Modal(copyModal)
        copyModal.getElementsByClassName("approve")[0].onclick = async function () {
            await copy_group_confirm();
        }
        copyModal.getElementsByClassName("cancel")[0].onclick = async function () {
            localStorage.removeItem("group_hash")
            localStorage.removeItem("group_id")
            window.history.pushState({}, "", "/groups");
        }
        myModal.toggle()
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
    else if (groups_data.status === 401){
        let go_to_login = await fetch("/", {
            method: "GET"
        });
        if (go_to_login.status === 200){
            document.documentElement.innerHTML = (await ((await go_to_login).text())).toString()
            window.history.pushState({},"", "/");
            rel();
        }
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    if (document.getElementById("approveCopyModal") !== null){
        const urlParams = new URLSearchParams(window.location.search);
        const group_id = urlParams.get('create_group');
        const group_hash = urlParams.get('group_hash');
        localStorage.setItem("group_id", group_id);
        localStorage.setItem("group_hash", group_hash);
    }
    await group_content();
});