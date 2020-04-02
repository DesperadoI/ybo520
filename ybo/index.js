var hearts = [];

$(top).ready(function () {
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
    var pop = setInterval("bubbling()", 2000);

    document.addEventListener('visibilitychange', function () {
        var isHidden = document.hidden;
        if (isHidden) {
            clearInterval(pop);
            $("title").html("(๑´灬`๑) 你快回来~");
        } else {
            bubbling();
            pop = setInterval("bubbling()", 2000);
            $("title").html("(❤ ω ❤) mua~");
        }
    });
});

function bubbling() {
    showHeart(30);
    setTimeout("showHeart(130)", 400);
    setTimeout("showHeart(230)", 800);
    setTimeout("showHeart(330)", 600);
    setTimeout("showHeart(430)", 1200);
    setTimeout("showHeart(530)", 1000);
    setTimeout("showHeart(630)", 200);
    setTimeout("showHeart(730)", 1800);
    setTimeout("showHeart(830)", 1600);
    setTimeout("showHeart(930)", 200);
    setTimeout("showHeart(1030)", 400);
    setTimeout("showHeart(1130)", 800);
    setTimeout("showHeart(1230)", 1600);
    setTimeout("showHeart(1330)", 1200);
    setTimeout("showHeart(1430)", 800);
    setTimeout("showHeart(1530)", 400);
    setTimeout("showHeart(1630)", 1800);
    setTimeout("showHeart(1730)", 600);
    setTimeout("showHeart(1830)", 1200);
    setTimeout("showHeart(1930)", 1800);
    setTimeout("showHeart(2030)", 1200);
}

function showHeart(x) {
    var d = document.createElement("div");
    d.className = "heart";
    hearts.push({
        el: d,
        x: x,
        y: $(".center").height() - 20,
        scale: 1,
        alpha: 1,
        color: randomColor()
    });
    document.body.appendChild(d);
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
        if (i % 20 == 0) {
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