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
        textarea.innerText = response.front.toString();
        textarea2.innerText = response.back;
        title.innerText = document.getElementById("page_name").innerText
        description.innerText = response.descriptionText;
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
            document.cookie = "card_dict=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        window.history.pushState({},"", "/groups");
        rel();
    }
}