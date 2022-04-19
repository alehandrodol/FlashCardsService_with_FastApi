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
        term.innerText = data.front;
        localStorage.setItem("frontTerm", data.front);
        localStorage.setItem("backTerm", data.back);
        localStorage.setItem("card_id", data.id);
    }
}

async function onloadTest(){
    let front = localStorage.getItem("frontTerm");
    if (front === null){
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