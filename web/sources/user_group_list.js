
$(document).ready(function () {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    if (email == null || password == null) {
        fail_login();
    }
    else {
        login(email, password).then(result => {
            if (result["status"] == "Success") {
                init_group_list();
            }
            else {
                fail_login();
            }
        });
    }

    $("button.logout").on("click", function() {
        localStorage.clear();
        window.location.replace('./');
    });

    $("#add-group").on("click", function() {
        window.location.href = `user_group_add.html`;
    });

})

async function init_group_list() {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.pathname = "/group/index"
    let data = {email: email, password: hash};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    let res_json = await res.json();

    if (res_json["status"] == "Success") {
        for(let i = 0; i < res_json["groups"].length; i++){
            console.log(res_json["groups"][i]);
            add_group_to_table(res_json["groups"][i]["id"], res_json["groups"][i]["name"]);
        }
    }

}

async function erase_group(id) {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.pathname = "/group/erase"
    let data = {email: email, password: hash, group_id: id};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();

    if (res_json["status"] == "Success") {
        $(`#row-${id}`).remove();
    }

}

function add_group_to_table(id, name) {
    $("#row-add").before(`<tr id="row-${id}">
<td>${name}</td>
<td><button type="button" class="btn btn-outline-primary" id="detail-${id}">詳細</button></td>
<td><button type="button" class="btn btn-outline-danger" id="erase-${id}">削除</button></td>
</tr>`);
    
    $(`#detail-${id}`).on("click", function() {
        window.location.href = `user_group_detail.html?id=${id}`;
    });
    $(`#erase-${id}`).on("click", function() {
        erase_group(id);
    });
}


function fail_login() {
    localStorage.clear();
    $(".modal-title").text("ERROR!");
    $(".message").text("ログインしてください。"); 
    var myModal = new bootstrap.Modal(document.getElementById('unclosable-modal'), {backdrop: "static", keyboard: false});
    myModal.show();
}

async function sha256(text){
    const uint8  = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest('SHA-256', uint8)
    return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2,'0')).join('')
}

async function login(email, password) {
    let hash = await sha256(password);
    let url = new URL(location.href);
    url.port = 8000;
    url.pathname = "/user/log_in"
    let data = {email: email, password: hash}

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();
    return res_json;
}

async function signup(email, password, name) {
    let hash = await sha256(password);
    let url = new URL(location.href);
    url.port = 8000;
    url.pathname = "/user/sign_up"
    let data = {email: email, password: hash, name: name}

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();
    return res_json;
}
