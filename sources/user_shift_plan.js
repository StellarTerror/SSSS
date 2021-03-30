dates = [];
group_id = get_url_queries()["id"];

$(document).ready(async function () {
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

    await get_dates();

    events = [];
    for (let i = 0; i < dates.length; i++) {
        events.push({
            groupId: 1,
            start: dates[i],
            color: "pink",
            display: "inverse-background",
        });
    }

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        dateClick: function(info) {
            console.log(info.dateStr);
            if(dates.includes(info.dateStr)){
                location.href= `./user_shift_plan_detail.html?id=${group_id}&date=${info.dateStr}`
            }
        }
    });
    calendar.render();

    $("button.logout").on("click", function() {
        localStorage.clear();
        window.location.replace('./');
    });

    $("#back-page").on("click", function() {
        location.href= `./user_group_detail.html?id=${group_id}`
    });

})

async function get_dates() {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/employees_required/index";
    let data = {email: email, password: hash, group_id: group_id};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();

    if (res_json["status"] == "Success") {
        for (let i = 0; i < res_json["dates"].length; i++) {
            dates.push(res_json["dates"][i]["date"]);
        }
    }
    console.log(dates);
}

function get_url_queries() {
    var queryStr = window.location.search.slice(1);
        queries = {};
    if (!queryStr) {
      return queries;
    }

    queryStr.split('&').forEach(function(queryStr) {
      var queryArr = queryStr.split('=');
      queries[queryArr[0]] = queryArr[1];
    });

    return queries;
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
