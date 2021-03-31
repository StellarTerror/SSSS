editing_employee = -1;
group_id = get_url_queries()["id"];
roles = [];
roles_of_user = [];

$(document).ready(async function () {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    if (email == null || password == null) {
        fail_login();
    }
    else {
        login(email, password).then(result => {
            if (result["status"] == "Success") {
                init_employee_list();
                init_role_list();
            }
            else {
                fail_login();
            }
        });
    }
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    })

    get_name();

    $("#add-employee").on("click", add_employee);
    $("#add-role").on("click", add_role);
    $("#confirm-edit-role").on("click", function() {
        update_role(editing_employee);
    })
    $("#create-shift-plan").on("click", function() {
        location.href= `./user_shift_plan.html?id=${group_id}`
    })
    $("#edit-shift").on("click", function() {
        location.href= `./user_edit_shift.html?id=${group_id}`
    })
    $("#submit-shift").on("click", function() {
        var myModal = new bootstrap.Modal(document.getElementById('modal-amlify-confirm'));
        myModal.show();
    })
    $("#submit-shift-ok").on("click", function() {
        submit_shift();
    })
    $("#discard-change").on("click", function() {
        init_employee_list();
    })
    $("button.logout").on("click", function() {
        localStorage.clear();
        window.location.replace('./');
    });

    let is_used = await is_fixed();
    if (is_used) {
        $("#create-shift-plan").hide();
        $("#submit-shift").hide();
    }
    else {
        $("#edit-shift").hide();
    }
})

async function get_name() {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/group/get_name";
    let data = {email: email, password: hash, group_id: group_id};

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
        $("#group-name").text(res_json["name"]);
    }
}

async function is_fixed() {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/is_fixed/by_owner";
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
        return res_json["is_used"];
    }
    return false;
}
async function submit_shift() {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/fixed_shift/fix_shift";
    let data = {email: email, password: hash, group_id: group_id};

    $("#submit-shift").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
計算中...`)
    $("#submit-shift").prop("disabled", true);
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
        alert("シフトを確定させました。");
        location.reload();
    }
    $("#submit-shift").html(`シフトを確定させる`);
    $("#submit-shift").prop("disabled", false);
}

async function add_employee() {
    let name = $("#new-employee-name").val();
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/instance_user/add";
    let data = {email: email, password: hash, group_id: group_id, name: name};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();

    if (res_json["status"] == "Success") {
        add_employee_to_table(res_json["random_token"], name);
        $("#new-employee-name").val("")
    }
}

async function erase_employee(token) {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/instance_user/erase";
    let data = {email: email, password: hash, group_id: group_id, random_token: token};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();

    if (res_json["status"] == "Success") {
        $(`#row-${token}`).remove();
    }
}

async function add_role() {
    let name = $("#new-role-name").val();
    if (name == "default") return;
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/role/add";
    let data = {email: email, password: hash, group_id: group_id, name: name};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();

    if (res_json["status"] == "Success") {
        add_role_to_table(res_json["id"], name);
        roles.push(res_json["id"])
        $("#new-role-name").val("")
    }
}

async function erase_role(id) {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/role/erase";
    let data = {email: email, password: hash, group_id: group_id, role_id: id};

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
        roles = roles.filter(n => n != id);
        init_employee_list();
    }
}

async function update_role(token) {
    for(let i = 0; i < roles.length; i++){
        if ($(`#role-checkbox-${roles[i]}`).prop("checked")) {
            await assign_role(token, roles[i]);
        }
        else {
            await unassign_role(token,roles[i]);
        }
    }
    init_employee_list();
}

async function assign_role(token, role_id) {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/role_assign/assign";
    let data = {email: email, password: hash, group_id: group_id, role_id: role_id, token: token};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();
}

async function unassign_role(token, role_id) {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/role_assign/unassign";
    let data = {email: email, password: hash, group_id: group_id, role_id: role_id, token: token};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();
}

async function init_role_list() {
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
        for (let i = 0; i < res_json["roles"].length; i++) {
            add_role_to_table(res_json["roles"][i]["id"], res_json["roles"][i]["name"]);
            roles.push(res_json["roles"][i]["id"])
        }
    }
}

async function init_employee_list() {
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

    if (res_json["status"] == "Success") {
        $(`#row-add-employee`).prevAll().remove();
        for (let i = 0; i < res_json["instance_users"].length; i++) {
            add_employee_to_table(res_json["instance_users"][i]["random_token"], res_json["instance_users"][i]["name"]);
        }
    }
}

async function add_employee_to_table(token, name) {
    $("#row-add-employee").before(`<tr id="row-${token}">
<td id="employee-td-name-${token}">${name}</td>
<td id="employee-td-roles-${token}">
<button type="button" class="btn btn-outline-primary m-1" id="role-edit-${token}">編集</button>
</td>
<td id="employee-td-copy-${token}"><button type="button" class="btn btn-outline-primary" id="token-copy-${token}"  data-bs-toggle="tooltip" data-bs-trigger="click" title="クリップボードにコピーしました。">コピー</button></td>
<td id="employee-td-delete-${token}"><button type="button" class="btn btn-outline-danger" id="employee-erase-${token}">削除</button></td>
</tr>`);

    await add_role_to_employee(token);

    $(`#role-edit-${token}`).on("click", async function() {
        editing_employee = token;
        await add_role_to_employee(token);
        for (let i = 0; i < roles.length; i++) {
            $(`#role-checkbox-${roles[i]}`).prop('checked', false)
        }
        for (let i = 0; i < roles_of_user.length; i++) {
            $(`#role-checkbox-${roles_of_user[i]}`).prop('checked', true)
        }
        var myModal = new bootstrap.Modal(document.getElementById('modal-edit-role'), {});
        myModal.show();
    });

    $(`#token-copy-${token}`).on("click", function() {
        let url = new URL(location.href);
        url.pathname = `shift_request.html`;
        url.search = `?token=${token}`;
        navigator.clipboard.writeText(url.href);
    });

    var tooltip = new bootstrap.Tooltip(document.getElementById(`token-copy-${token}`), {});
    document.getElementById(`token-copy-${token}`).addEventListener('shown.bs.tooltip', function () {
        setTimeout(function () { tooltip.hide() }, 1000); 
    });

    $(`#employee-erase-${token}`).on("click", function() {
        erase_employee(token);
    });
}

async function add_role_to_employee(token) {

    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/role_assign/index_by_user";
    let data = {email: email, password: hash, group_id: group_id, token: token};

    let res = await fetch(url.href, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    let res_json = await res.json();

    if (res_json["status"] == "Success") {
        $(`#role-edit-${token}`).prevAll().remove();
        roles_of_user = [];
        for(let i = 0; i < res_json["roles"].length; i++) {
            roles_of_user.push(res_json["roles"][i]["id"]);
            $(`#role-edit-${token}`).before(`<span class="badge bg-primary m-1">${res_json["roles"][i]["name"]}</span>`)
        }
    }
}

function add_role_to_table(id, name) {
    $("#row-add-role").before(`<tr id="row-${id}">
<td id="role-td-name-${id}">${name}</td>
<td id="role-td-checkbox-${id}"><input type="checkbox" class="form-check-input" id="role-checkbox-${id}"></td>
<td id="role-td-edit-${id}"><button type="button" class="btn btn-outline-primary" id="role-edit-${id}">編集</button></td>
<td id="role-td-delete-${id}"><button type="button" class="btn btn-outline-danger" id="role-erase-${id}">削除</button></td>
</tr>`);

    $(`#role-erase-${id}`).on("click", function() {
        erase_role(id);
    });

    $(document).on("click", `#role-edit-${id}`, function() {
        $(`#role-td-name-${id}`).html(`<input type="text" id="new-name-${id}" class="form-control" placeholder="新しい名前" value="${name}">`)
        $(`#role-td-edit-${id}`).html(`<button type="button" class="btn btn-primary" id="submit-name-${id}">完了</button>`)
    })

    $(document).on("click", `#submit-name-${id}`, function() {
        edit_role_name(id, $(`#new-name-${id}`).val());
    })
}

async function edit_role_name(id, name) {
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let hash = await sha256(password);

    let url = new URL(location.href);
    url.port = 8000;
    url.search = "";
    url.pathname = "/role/edit";
    let data = {email: email, password: hash, group_id: group_id, role_id: id, name: name};

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
        $(`#role-td-name-${id}`).html(`${name}`)
        $(`#role-td-edit-${id}`).html(`<button type="button" class="btn btn-outline-primary" id="role-edit-${id}">編集</button>`)
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
