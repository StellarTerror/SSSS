dates = [];
group_id = get_url_queries()["id"];
calendar = null;

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
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events,
        dateClick: function(info) {
            console.log(info.dateStr);
            if(dates.includes(info.dateStr)){
                location.href= `./user_edit_shift_detail.html?id=${group_id}&date=${info.dateStr}`
            }
        },
        eventContent: function(arg) {
            if(arg.event.title == "")return { domNodes: []};
            let dot = document.createElement("div");
            dot.classList.add("fc-daygrid-event-dot");
            let title = document.createElement('div')
            title.classList.add("fc-event-title");
            let start = arg.event.startStr.split("+")[0].split("T")[1];
            let end = arg.event.endStr.split("+")[0].split("T")[1];
            let s = start.split(":")[0] + ":" + start.split(":")[1];
            let e = end.split(":")[0] + ":" + end.split(":")[1];

            title.innerHTML = arg.event.title + "<br>" + s + "~" + e;

            let arrayOfDomNodes = [ dot,title ]
            return { domNodes: arrayOfDomNodes }
        }
    });
    calendar.render();

    await get_invalid_dates();

    $("button.logout").on("click", function() {
        localStorage.clear();
        window.location.replace('./');
    });

    $("#back-page").on("click", function() {
        location.href= `./user_group_detail.html?id=${group_id}`
    });

})

async function get_invalid_dates() {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);  

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/fixed_shift/invalid";
    let data = {email: email, password: hash, group_id: group_id};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();

    console.log(res_json)
    if (res_json["status"] == "Success") {
        for (let i = 0; i < res_json["dates"].length; i++){
            if (res_json["dates"][i]["status"] == 0)continue;
            let start = to_iso8601(res_json["dates"][i]["start_datetime"]);
            let end = to_iso8601(res_json["dates"][i]["end_datetime"]);
            calendar.addEvent({
                groupId: 2,
                title: "人数不足！",
                start: start,
                end: end,
            });
        }
    }
}

function to_iso8601(datestr) {
    let tmp = datestr.split(" ");
    return tmp[0] + "T" + tmp[1];
}

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
