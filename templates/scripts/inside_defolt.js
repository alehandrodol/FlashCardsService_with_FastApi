function rel(){
    location.reload();
}

async function exit(){
    let response = await fetch("/", {
        method: "GET"
    });
    if (response.status === 200){
        document.documentElement.innerHTML = (await ((await response).text())).toString()
        window.history.pushState({},"", "/");
        localStorage.clear()
        rel();
    }
}

async function cardFiller(card_id = -1, modalName){
    if (card_id === -1){
        card_id = localStorage.getItem("card_id");
    }
    let modal_card = document.getElementById(modalName);
    let response = await fetch(`cards/get_card?given_id=${card_id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    let title = modal_card.getElementsByClassName("modal-title")[0];
    response = JSON.parse((await response.text()).toString())
    let textarea = modal_card.getElementsByClassName("front_card")[0];
    let textarea2 = modal_card.getElementsByClassName("back_card")[0];
    let description = modal_card.getElementsByClassName("card_description")[0];
    if (modalName === "cardModal"){
        let stats = modal_card.getElementsByClassName("card_stats");
        textarea.innerText = response.front.toString();
        textarea2.innerText = response.back;
        if (window.location.href.includes("/cards")){
            let group_name = localStorage.getItem("group_name")
            if (group_name !== null)
                title.innerText = group_name
            else
                title.innerText = document.getElementById("page_name").innerText
        }
        else{
            title.innerText = (JSON.parse(localStorage.getItem("id_to_name")))[card_id]
        }
        description.innerText = response.descriptionText;
        stats[0].innerText = `Кол-во успешных повторений: ${response.true_verdicts}`
        stats[1].innerText = `Кол-во повторений: ${response.repeats}`
    }
    else if (modalName === "myModal"){
        textarea.value = response.front.toString();
        textarea2.value = response.back;
        title.innerText = "Изменение значений карточки"
        description.innerText = response.descriptionText;
    }
}

async function back_to_groups(){
    let response = await fetch("/groups", {
        method: "GET"
    });
    if (response.status === 200){
        document.documentElement.innerHTML = (await ((await response).text())).toString()
        if (window.location.href.includes("/testing")){
            localStorage.removeItem("frontTerm");
            localStorage.removeItem("backTerm");
            localStorage.removeItem("card_id");
            localStorage.removeItem("TestEnd");
            localStorage.removeItem("trueVer");
            localStorage.removeItem("falseVer");
            document.cookie = "card_dict=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        if (window.location.href.includes("/cards")){
            localStorage.removeItem("curBackIdCard");
            localStorage.removeItem("curFrontIdCard");
            localStorage.removeItem("group_name");
        }
        if (window.location.href.includes("/search")){
            localStorage.removeItem("id_to_name");
        }
        window.history.pushState({},"", "/groups");
        rel();
    }
}

async function find_cards(searchString){
    let response;
    if (window.location.href.includes("/cards")){
        response = (await fetch(`/cards/find_by_string?string=${searchString}&search_in=${localStorage.getItem("group_id")}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        }))
        if (response.status === 200){
            let title = document.getElementById("page_name")
            localStorage.setItem("group_name", title.innerText)
            title.innerText = `${searchString}`
            document.getElementById("create").style.display = "none"
            document.getElementById("zat").style.display = "none"

            let search_data = JSON.parse((await response.text()).toString())
            console.log(search_data)
            let cont = document.getElementById("cards_container");
            cont.innerHTML = "";
            for (let i = search_data.length-1; i >= 0; i--){
                let cur_card = search_data[i][0];
                let new_card = createCardHTML((search_data.length-1 - i), cur_card.front, cur_card.active);
                new_card.setAttribute("data-id", `${cur_card.id}`)
                cont.append(new_card);
            }
        }
    }
    else{
        response = await fetch(`/search?searchString=${searchString}`, {
            method: "GET"
        });
        if (response.status === 200){
            document.documentElement.innerHTML = (await ((await response).text())).toString()
            window.history.pushState({},"", `/search?searchString=${searchString}`);
            rel();
        }
    }
}

async function onClickSearch(event){
    let searchInput = event.target.parentElement.parentElement.getElementsByClassName("search_input")[0];
    await find_cards(searchInput.value);
}

function bind_searchBut(){
    let search_but = document.getElementById("findCardsModal").getElementsByClassName("approve")[0];
    search_but.onclick = async function(event) {
        await onClickSearch(event)
    }
    document.getElementById("search_input").addEventListener("keypress", function onEvent(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            search_but.click();
        }
    });
}