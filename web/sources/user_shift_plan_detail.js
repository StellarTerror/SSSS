
group_id = get_url_queries()["id"];
date = get_url_queries()["date"]
roles = []
name_to_id = {}
calendar = null;
change_start = null;
change_end = null;
change_role = null;

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

    calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
        headerToolbar: {
            start: 'title',
            center: '',
            end: ''
        },
        initialView: 'resourceTimeGridDay',
        initialDate: date,
        resources: [],
        selectable: true,
        allDaySlot: false,
        slotLabelFormat: {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false,
        },
        select: function(info) {
            change_start = info.startStr.split("+")[0];
            change_end = info.endStr.split("+")[0];
            change_role = Number(info.resource.id)
            var myModal = new bootstrap.Modal(document.getElementById('modal-input-number'), {});
            myModal.show();
        }
    });

    calendar.render();
    add_roles_to_calendar();
    add_plan_to_calendar();

    $("button.logout").on("click", function() {
        localStorage.clear();
        window.location.replace('./');
    });

    $("#submit-number").on("click", function() {
        update_required();
    })

    $("#back-page").on("click", function() {
        location.href= `./user_shift_plan.html?id=${group_id}`
    });

    $('#required-number').on('keydown', function(e) {
        var k = e.keyCode;
        if(!((k >= 48 && k <= 57) || (k >= 96 && k <= 105) || k == 32 || k == 8 || k == 46 || k == 39 || k == 37)) {
            return false;
        }
    });

})

function to_iso8601(datestr) {
    let tmp = datestr.split(" ");
    return tmp[0] + "T" + tmp[1];
}

async function update_required() {
    let num = $("#required-number").val();
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/employees_required/update";
    let data = {email: email, password: hash, group_id: group_id, role_id: change_role, requireds: [{start_datetime: change_start, end_datetime: change_end, num: num}]};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();

    if (res_json["status"] == "Success") {
        add_plan_to_calendar();
    }
}

async function add_plan_to_calendar() {
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
        calendar.removeAllEvents();
        for (let i = 0; i < res_json["requireds"].length; i++){
            let start = to_iso8601(res_json["requireds"][i]["start_datetime"]);
            let end = to_iso8601(res_json["requireds"][i]["end_datetime"]);
            let color = `hsl(${240 - 360 / 7 * res_json["requireds"][i]["num"]}, 80%, 60%)`;
            if (res_json["requireds"][i]["num"] == 0) {
                color = "#FFFFFF";
            }
            calendar.addEvent({
                title: res_json["requireds"][i]["num"] + "人",
                start: start,
                end: end,
                color: color,
                display: "background",
                resourceId: String(res_json["requireds"][i]["role_id"]),
            });
        }
    }
}

function add_roles_to_calendar() {
    get_roles().then(_ => {
        for(let i = 0; i < roles.length; i++){
            calendar.addResource({
                title: roles[i]["name"],
                id: String(roles[i]["id"])
            });
        }
    });
}

async function get_roles() {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/role/index";
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
        roles = res_json["roles"];
        for(let i = 0; i < roles.length; i++) {
            name_to_id[roles[i]["name"]] = roles[i]["id"]
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
