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
        }
        window.history.pushState({},"", "/groups");
        rel();
    }
}