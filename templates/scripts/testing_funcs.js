function get_cookie(name){
    return document.cookie.split(';').some(c => {
        return c.trim().startsWith(name + '=');
    });
}

async function nextCard() {
    let response = await fetch(`/cards/next/${localStorage.getItem("group_id")}`, {
        method: "GET",
        headers: {
            "accept": "application/json",
            "Cookie": "card_dict={}",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });
    if (response.status === 200){
        let data = JSON.parse((await response.text()).toString())
        let term = document.getElementById("term_of_card");
        if (term.innerText === localStorage.getItem("backTerm")){
            term.click();
        }
        term.innerText = data.front;
        localStorage.setItem("frontTerm", data.front);
        localStorage.setItem("backTerm", data.back);
        localStorage.setItem("card_id", data.id);
    }
    else if (response.status === 205){
        localStorage.setItem("TestEnd", "True");
        await fetch("/static/testing_main_ending.html")
            .then(response=> response.text())
            .then(text=> document.getElementById('inside_main').innerHTML = text);
        put_stats();
    }
}

async function replayBut(){
    localStorage.setItem("TestEnd", "False");
    await fetch("/static/testing_main_defolt.html")
            .then(response=> response.text())
            .then(text=> document.getElementById('inside_main').innerHTML = text);
    localStorage.setItem("trueVer", "0");
    localStorage.setItem("falseVer", "0");
    await nextCard();
}

function put_stats(){
    let par = document.getElementById("test_stats");
    let trueVer = Number(localStorage.getItem("trueVer"));
    let falseVer = Number(localStorage.getItem("falseVer"));
    if (trueVer % 10 >= 5 || [11, 12, 13, 14].indexOf(trueVer) || trueVer % 10 === 0){
        par.innerText = `Ты запомнил: ${trueVer} карточек`;
    }
    else if (trueVer % 10 === 1){
        par.innerText = `Ты запомнил: ${trueVer} карточку`;
    }
    else {
        par.innerText = `Ты запомнил: ${trueVer} карточки`;
    }
    par.innerText = par.innerText + `\nА всего их было: ${falseVer+trueVer}`;
}

async function onloadTest(){
    if (localStorage.getItem("TestEnd") === "True"){
        await fetch("/static/testing_main_ending.html")
            .then(response=> response.text())
            .then(text=> document.getElementById('inside_main').innerHTML = text);
        put_stats();
        return
    }
    let front = localStorage.getItem("frontTerm");
    if (front === null){
        localStorage.setItem("trueVer", "0");
        localStorage.setItem("falseVer", "0");
        await nextCard();
        return;
    }
    let term = document.getElementById("term_of_card");
    term.innerText = front;
}

async function Verdict(verdict){
    let response = await fetch(`cards/repeated?verdict=${verdict}`, {
        method: "POST",
        headers: {
            "accept": "application/json",
            "Cookie": "card_dict={}",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    if (response.status === 200){
        if (verdict === "true"){
            let cur_vers = localStorage.getItem("trueVer");
            localStorage.setItem("trueVer", (Number(cur_vers) + 1).toString())
        }
        else{
            let cur_vers = localStorage.getItem("falseVer");
            localStorage.setItem("falseVer", (Number(cur_vers) + 1).toString())
        }
        await nextCard();
    }
}

function showAnswer(iam){
    let term = document.getElementById("term_of_card");
    term.innerText = localStorage.getItem("backTerm");
    term.parentElement.style.backgroundColor = "#60367A";
    term.style.color = "#FFFFFF";

    iam.onclick = function() {
        showTerm(iam);
    }
}

function showTerm(iam) {
    let term = document.getElementById("term_of_card");
    term.innerText = localStorage.getItem("frontTerm");
    term.parentElement.style.backgroundColor = "#FFE4AF";
    term.style.color = "#000000";
    iam.onclick = function() {
        showAnswer(iam);
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    await onloadTest();
});