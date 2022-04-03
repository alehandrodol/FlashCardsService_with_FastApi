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

async function start_test(){
    let response = await fetch("/testing", {
            method: "GET"
        });
        if (response.status === 200){
            document.documentElement.innerHTML = (await ((await response).text())).toString()
            window.history.pushState({},"", "/testing");
            location.reload();
        }
}