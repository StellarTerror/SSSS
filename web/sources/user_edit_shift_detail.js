group_id = get_url_queries()["id"];
date = get_url_queries()["date"];
roles = [];
users = [];
calendar = null;
change_start = null;
change_end = null;
change_user = null;

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
            change_user = info.resource.id
            var myModal = new bootstrap.Modal(document.getElementById('modal-edit-shift'), {});
            myModal.show();
        }
    });

    calendar.render();
    await add_users_to_calendar();
    await add_shift_to_calendar();
    await add_roles_to_list();

    $("button.logout").on("click", function() {
        localStorage.clear();
        window.location.replace('./');
    });

    $("#edit-shift").on("click", function() {
        update_shift();
    })

    $("#back-page").on("click", function() {
        location.href= `./user_edit_shift.html?id=${group_id}`
    });

})

async function update_shift() {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/fixed_shift/update";

    let data = {email: email, password: hash, group_id: group_id, random_token: change_user, 
        shifts: [{start_datetime: change_start, end_datetime: change_end, status: $("#shift-detail").val()}]};
    
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
        add_shift_to_calendar();
    }
}

function to_iso8601(datestr) {
    let tmp = datestr.split(" ");
    return tmp[0] + "T" + tmp[1];
}

async function add_shift_to_calendar() {
    calendar.removeAllEvents();

    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/fixed_shift/index";

    for (let i = 0; i < users.length; i++) {
        let data = {random_token: users[i]["random_token"]};

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
            for (let j = 0; j < res_json["shifts"].length; j++){
                if(res_json["shifts"][j]["status"] == -1)continue;
                let start = to_iso8601(res_json["shifts"][j]["start_datetime"]);
                let end = to_iso8601(res_json["shifts"][j]["end_datetime"]);
                calendar.addEvent({
                    title: res_json["shifts"][j]["role_name"],
                    start: start,
                    end: end,
                    color: `hsl(${240 - 360 / 5 * res_json["shifts"][j]["status"]}, 80%, 60%)`,
                    display: "background",
                    resourceId: String(users[i]["random_token"]),
                });
            }
        }
    }
}

async function add_users_to_calendar() {
    await get_users();
    for (let i = 0; i < users.length; i++) {
        calendar.addResource({
            title: users[i]["name"],
            id: String(users[i]["random_token"])
        });
    }
}

async function add_roles_to_list() {
    await get_roles();
    for (let i = 0; i < roles.length; i++) {
        $("#delete-shift").before(`<option value="${roles[i]["id"]}" id="delete-shift">${roles[i]["name"]}</option>`)
    }
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
    }
}

async function get_users() {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/instance_user/index";
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
        users = res_json["instance_users"];
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
