$(document).ready(function () {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    if (email != null && password != null) {
        login(email, password).then(result => {
            if (result["status"] == "Success") {
                window.location.replace('user_group_list.html');
            }
            else {
                localStorage.clear();
            }
        });
    }

    $("#login").submit(login_button);
    $("#signup").submit(signup_button);
})

async function sha256(text){
    const uint8  = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest('SHA-256', uint8)
    return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2,'0')).join('')
}

function login_button() {
    let email = $("#email").val();
    let password = $("#password").val();

    login(email, password).then(result => {
        console.log(result);
        if (result["status"] == "Success") {
            localStorage.setItem("email", email);
            localStorage.setItem("password", password)
            window.location.replace('user_group_list.html');
        }
        else {
            $(".modal-title").text("ログイン失敗")
            $(".message").text(result["message"]); 
            var myModal = new bootstrap.Modal(document.getElementById('modal'), {});
            myModal.show();
        }
    });
    return false;
}

function signup_button() {
    let email = $("#email").val();
    let password = $("#password").val();
    let name = $("#username").val();

    signup(email, password, name).then(result => {
        if (result["status"] == "Success") {
            $(".modal-title").text("登録完了")
            $(".message").text("登録完了しました！"); 
            var myModal = new bootstrap.Modal(document.getElementById('modal'), {});
            myModal.show();
            setTimeout(function () {location.href = "/";}, 1000);
        }
        else {
            $(".modal-title").text("登録失敗");
            $(".message").text(result["message"]); 
            var myModal = new bootstrap.Modal(document.getElementById('modal'), {});
            myModal.show();
        }
    });
    return false;
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
