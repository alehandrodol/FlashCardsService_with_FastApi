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
        }
        if (window.location.href.includes("/search")){
            localStorage.removeItem("id_to_name");
        }
        window.history.pushState({},"", "/groups");
        rel();
    }
}

async function find_cards(searchString){
    let response = await fetch(`/search?searchString=${searchString}`, {
        method: "GET"
    });
    if (response.status === 200){
        document.documentElement.innerHTML = (await ((await response).text())).toString()
        window.history.pushState({},"", `/search?searchString=${searchString}`);
        rel();
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