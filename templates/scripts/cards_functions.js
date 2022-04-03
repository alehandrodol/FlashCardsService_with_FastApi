async function edit_button_behav(event, btn_edit, btn_create){
    event.preventDefault();
    btn_edit.textContent = "Удалить";
    btn_create.textContent = "Отмена";
    let a = document.getElementsByTagName("label");
    for (let i = 0; i < a.length; i++) {
        a[i].style.display = "inline-flex";
    }
    btn_create.addEventListener('click', async function (event){
        event.preventDefault();
        btn_edit.textContent = "Редактировать";
        btn_create.textContent = "Создать";
        for (let i = 0; i < a.length; i++) {
            a[i].style.display = "none";
        }
    })
}

document.addEventListener("DOMContentLoaded", function() {
    let btn_edit = document.querySelector('button[id=edit]');
    let btn_create = document.querySelector('button[id=create]');
    btn_edit.addEventListener('click', async function (event) {
        await edit_button_behav(event, btn_edit, btn_create);
    });
});