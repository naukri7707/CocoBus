function login() {
    const username = $('#username').val();
    const password = $('#password').val();
    $.post(
        "/user/login",
        {
            username: username,
            password: password
        },
        (res) => {
            if (res.code <= 0) {
                alert(res.msg);
                if (res.code === 0) {
                    window.location.href = "/";
                }
            } else {
                alert("奇怪的錯誤，請聯繫管理員\n" + res.msg + "\nError Code:" + res.code);
            }
        }
    );
}

function signup() {
    const username = $('#username').val()
    const password = $('#password').val()
    const checkPassword = $('#checkPassword').val()
    const nickname = $('#nickname').val()
    const cellphone = $('#cellphone').val()
    const email = $('#email').val()
    if (password != checkPassword) {
        assert.log("兩次輸入的密碼不相同")
    } else {
        $.post(
            "/user/sign-up",
            {
                username: username,
                password: password,
                nickname: nickname,
                cellphone: cellphone,
                email: email
            },
            (res) => {
                if (res.code <= 0) {
                    alert(res.msg);
                    if (res.code === 0) {
                        window.location.href = "login.html";
                    }
                } else {
                    alert("奇怪的錯誤，請聯繫管理員\n" + res.msg + "\nError Code:" + res.data.code);
                }
            }
        );
    }
}