var hearts = [];

$(document).ready(function () {
    //计算时间
    getDiff();
    setInterval("getDiff()", 1000);

    //鼠标点击和移动时冒出小心心 ♥
    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                setTimeout(callback, 1000 / 60);
            }
    })();
    init();

    bubbling();
    var pop = setInterval("bubbling()", 1000);

    window.onfocus = function(){
        bubbling();
        pop = setInterval("bubbling()", 1000);
        $("title").html("(❤ ω ❤) mua~");
    }

    window.onblur = function(){
        clearInterval(pop);
        $("title").html("(๑´灬`๑) 你快回来~");
    }

});

function bubbling() {
    showHeart(30);
    setTimeout("showHeart(130)", 200);
    setTimeout("showHeart(230)", 400);
    setTimeout("showHeart(330)", 300);
    setTimeout("showHeart(430)", 600);
    setTimeout("showHeart(530)", 500);
    setTimeout("showHeart(630)", 100);
    setTimeout("showHeart(730)", 900);
    setTimeout("showHeart(830)", 800);
    setTimeout("showHeart(930)", 100);
    setTimeout("showHeart(1030)", 200);
    setTimeout("showHeart(1130)", 400);
    setTimeout("showHeart(1230)", 800);
    setTimeout("showHeart(1330)", 600);
    setTimeout("showHeart(1430)", 400);
    setTimeout("showHeart(1530)", 200);
    setTimeout("showHeart(1630)", 900);
    setTimeout("showHeart(1730)", 300);
    setTimeout("showHeart(1830)", 600);
    setTimeout("showHeart(1930)", 900);
    setTimeout("showHeart(2030)", 600);
}

function showHeart(x) {
    var d = document.createElement("div");
    d.className = "heart";
    hearts.push({
        el: d,
        x: x,
        y: $(".center").height() + 50,
        scale: 1,
        alpha: 1,
        color: randomColor()
    });
    document.body.appendChild(d);
}

function getDiff(together) {
    var together = new Date("2018-11-01 02:29:00");
    var current = new Date();
    var diff = current.getTime() - together.getTime();
    var day = diff / 1000 / 60 / 60 / 24 + "";
    var hour = (("0." + day.split(".")[1]) * 24) + "";
    var min = (("0." + hour.split(".")[1]) * 60) + "";
    var second = (("0." + min.split(".")[1]) * 60) + "";
    $("#day").html(parseInt(day));
    $("#hour").html(parseInt(hour));
    $("#min").html(parseInt(min));
    $("#second").html(parseInt(second));
}

function init() {
    css(".heart{width: 10px;height: 10px;position: fixed;background: #f00;transform: rotate(45deg);" +
        "-webkit-transform: rotate(45deg);-moz-transform: rotate(45deg);}.heart:after,.heart:before{content: '';" +
        "width: inherit;height: inherit;background: inherit;border-radius: 50%;-webkit-border-radius: 50%;" +
        "-moz-border-radius: 50%;position: absolute;}.heart:after{top: -5px;}.heart:before{left: -5px;}");
    attachEvent();
    gameloop();
}

function gameloop() {
    for (var i = 0; i < hearts.length; i++) {
        if (hearts[i].alpha <= 0) {
            document.body.removeChild(hearts[i].el);
            hearts.splice(i, 1);
            continue;
        }
        hearts[i].y--;
        hearts[i].scale += 0.004;
        hearts[i].alpha -= 0.013;
        hearts[i].el.style.cssText = "left:" + hearts[i].x + "px;top:" + hearts[i].y + "px;opacity:" + hearts[i].alpha + ";transform:scale(" + hearts[i].scale + "," + hearts[i].scale + ") rotate(45deg);background:" + hearts[i].color;
    }
    requestAnimationFrame(gameloop);
}

function attachEvent() {
    window.onclick = function (event) {
        createHeart(event);
    }
    var i = 0;
    window.onmousemove = function (event) {
        if (i % 15 == 0) {
            createHeart(event);
        }
        i++
    }
}

function createHeart(event) {
    var d = document.createElement("div");
    d.className = "heart";
    hearts.push({
        el: d,
        x: event.clientX - 5,
        y: event.clientY - 5,
        scale: 1,
        alpha: 1,
        color: randomColor()
    });
    document.body.appendChild(d);
}

function css(css) {
    var style = document.createElement("style");
    style.type = "text/css";
    try {
        style.appendChild(document.createTextNode(css));
    } catch (ex) {
        style.styleSheet.cssText = css;
    }
    document.getElementsByTagName('head')[0].appendChild(style);
}

function randomColor() {
    return "rgb(" + (~~(Math.random() * 255)) + "," + (~~(Math.random() * 255)) + "," + (~~(Math.random() * 255)) + ")";
}