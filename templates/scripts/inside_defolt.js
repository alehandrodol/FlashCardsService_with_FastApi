function rel(){
    location.reload();
}

async function main_cards(){
    let response = await fetch("/cards", {
            method: "GET"
        });
        if (response.status === 200){
            document.documentElement.innerHTML = (await ((await response).text())).toString()
            window.history.pushState({},"", "/cards");
            location.reload();
        }
}

async function exit(){
    let response = await fetch("/", {
        method: "GET"
    });
    if (response.status === 200){
        document.documentElement.innerHTML = (await ((await response).text())).toString()
        window.history.pushState({},"", "/");
        localStorage.removeItem('token');
        rel();
    }
}