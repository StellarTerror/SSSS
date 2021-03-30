dates = [];
current_date = null;
token = get_url_queries()["token"];
calendar = null;
user_name = null;

$(document).ready(async function () {
    await get_dates();
    let is_used = await is_fixed();
    if (is_used) {
        var calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
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
                if(e == "00:00")e = "24:00";
                title.innerHTML = arg.event.title + "<br>" + s + "~" + e;
    
                let arrayOfDomNodes = [ dot,title ]
                return { domNodes: arrayOfDomNodes }
            },
        });
        calendar.render();

        await add_shift_to_calendar();
        $("#shift-info").html(`ようこそ、${user_name}さん。<br>現在のシフト表が確認できます。`);
    }
    else {
        var calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            dateClick: function(info) {
                if(dates.includes(info.dateStr)){
                    current_date = info.dateStr;
                    var myModal = new bootstrap.Modal(document.getElementById('modal-input-date'), {});
                    myModal.show();
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
                if(e == "00:00")e = "24:00";
                title.innerHTML = s + "~" + e;
    
                let arrayOfDomNodes = [ dot,title ]
                return { domNodes: arrayOfDomNodes }
            },
            eventClick: function(info) {
                erase_request(info.event.startStr.split("+")[0], info.event.endStr.split("+")[0]);
            }
        });
        calendar.render();
    
        await update_shift_request();
        $("#shift-info").html(`ようこそ、${user_name}さん。<br>勤務可能な時間を入力してください。`);
    }
    
    $("#submit-date").on("click", function() {
        add_request();
    });

    $('#start-hour').change(function() {
        $("#start-minute").children().remove();
        if ($("#start-hour").val() <= 23) {
            $("#start-minute").append('<option value="00">00</option>');
            $("#start-minute").append('<option value="30">30</option>');
        }
        else {
            $("#start-minute").append('<option value="00">00</option>');
        }
    })

    $('#end-hour').change(function() {
        $("#end-minute").children().remove();
        if ($("#end-hour").val() <= 23) {
            $("#end-minute").append('<option value="00">00</option>');
            $("#end-minute").append('<option value="30">30</option>');
        }
        else {
            $("#end-minute").append('<option value="00">00</option>');
        }
    })

})

async function add_shift_to_calendar() {
    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/fixed_shift/index";
    let data = {random_token: token};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();
    console.log(res_json);
    if (res_json["status"] == "Success") {
        user_name = res_json["user_name"];
        for (let i = 0; i < res_json["shifts"].length; i++) {
            if (res_json["shifts"][i]["status"] == -1)continue;
            let start = to_iso8601(res_json["shifts"][i]["start_datetime"]);
            let end = to_iso8601(res_json["shifts"][i]["end_datetime"]);
            calendar.addEvent({
                title: res_json["shifts"][i]["role_name"],
                start: start,
                end: end,
            });
        }
        for (let i = 0; i < dates.length; i++) {
            calendar.addEvent({
                groupId: 1,
                start: dates[i],
                color: "pink",
                display: "inverse-background",
            });
        }
    }
}

async function is_fixed() {
    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/is_fixed/by_member";
    let data = {random_token: token};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();

    if (res_json["status"] == "Success") {
        return res_json["is_used"];
    }
    return false;
}

async function add_request() {
    let starttime = current_date + "T" + $("#start-hour").val() + ":" + $("#start-minute").val() + ":00";
    let endtime = current_date + "T" + $("#end-hour").val() + ":" + $("#end-minute").val() + ":00";
    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/shift_request/update";
    let data = {random_token: token, requests: [{start_datetime: starttime, end_datetime: endtime, status: 1}]};
    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();

    if (res_json["status"] == "Success") {
        update_shift_request();
    }

    $('#start-hour').val("00");
    $("#start-minute").val("00");
    $('#end-hour').val("00");
    $("#end-minute").val("00");
}

async function erase_request(start, end) {
    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/shift_request/update";
    let data = {random_token: token, requests: [{start_datetime: start, end_datetime: end, status: 0}]};
    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();
    if (res_json["status"] == "Success") {
        update_shift_request();
    }
}

async function update_shift_request() {
    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/shift_request/index";
    let data = {random_token: token};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();

    if (res_json["status"] == "Success") {
        user_name = res_json["user_name"];
        calendar.removeAllEvents();
        for (let i = 0; i < res_json["requests"].length; i++) {
            if (res_json["requests"][i]["status"] == 0)continue;
            let start = to_iso8601(res_json["requests"][i]["start_datetime"]);
            let end = to_iso8601(res_json["requests"][i]["end_datetime"]);
            let s = start.split("T")[1].split(":")[0] + ":" + start.split("T")[1].split(":")[1];
            let e = end.split("T")[1].split(":")[0] + ":" + end.split("T")[1].split(":")[1];
            calendar.addEvent({
                title: s + " ~ " + e,
                start: start,
                end: end,
            });
        }

        for (let i = 0; i < dates.length; i++) {
            calendar.addEvent({
                groupId: 1,
                start: dates[i],
                color: "pink",
                display: "inverse-background",
            });
        }
    }
}

function to_iso8601(datestr) {
    let tmp = datestr.split(" ");
    return tmp[0] + "T" + tmp[1];
}



async function get_dates() {
    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/shift_request/index";
    let data = {random_token: token};

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
