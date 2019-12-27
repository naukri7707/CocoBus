function setCookie(name, value, exDays) {
    var d = new Date();
    d.setTime(d.getTime() + (exDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = name + "=" + value + "; " + expires;
}

function getCookie(name) {
    name += "=";
    const cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var c = cookies[i].trim();
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function clearCookies() {
    document.cookie = "";
}