
dates = []

$(document).ready(function () {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    if (email == null || password == null) {
        fail_login();
    }
    else {
        login(email, password).then(result => {
            if (result["status"] == "Success") { }
            else {
                fail_login();
            }
        });
    }

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        dateClick: function(info) {
            if (info.dayEl.style.backgroundColor == "lightgreen"){
                info.dayEl.style.backgroundColor = ""
                dates = dates.filter(n => n != info.dateStr);
            }
            else {
                if(dates.length < 7) {
                    dates.push(info.dateStr);
                    info.dayEl.style.backgroundColor = 'lightgreen';
                }
            }
            console.log(dates);
        }
    });
    calendar.render();

    $("button.logout").on("click", function() {
        localStorage.clear();
        window.location.replace('./');
    });

    $("#add-group").submit(add_group);

    $("#goto-next").on("click", function() {
        var myModal = new bootstrap.Modal(document.getElementById('modal-create-group'), {});
        myModal.show();
    });

    $("#create-group").on("click", add_group);
})

async function add_group() {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);
    let new_group_name = $("#new-group-name").val();

    let send_dates = []
    dates.forEach(date => send_dates.push({date: date}));

    let url = new URL(location.href);
    url.port = 8000;
    url.pathname = "/group/add"
    let data = {email: email, password: hash, name: new_group_name, use_dates: send_dates};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();

    if (res_json["status"] == "Success") {
        var myModal = new bootstrap.Modal(document.getElementById('modal-create-success'), {});
        myModal.show();
    }
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
