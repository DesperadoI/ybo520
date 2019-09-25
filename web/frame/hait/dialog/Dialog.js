/**
 * 对话框组件
 *
 * @author pandong
 * @date 2013-03-16 下午12:39:30
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.dialog");

/**
 * 对话框的构造方法
 */
hait.dialog.Dialog = function () {

    /**
     * 对话框标题
     */
    this.title = "对话框";

    /**
     * 外部传入的样式
     */
    this.style = "width:500px;";

    /**
     * 对话框内容，可以是任何对象
     */
    this.body = null;

    /**
     * 是否存在遮罩层
     */
    this.isMask = true;

    /**
     * 对话框按钮栏，可以没有
     */
    this.buttons = null;

    /**
     * 事件
     */
    this.onafterclose = null; //对话框关闭事件

    /**
     * 私有属性
     */
    this._background = null;// 背景遮罩对象
};

// 继承于hait.base.Component对象
hait.dialog.Dialog.inherit(hait.base.Component);

/**
 * 这个方法针对将页面对象直接进行转换时使用
 */
hait.dialog.Dialog.prototype.convert = function (obj) {

    // 调用父级的同名方法
    this.father(hait.base.Component, "convert", obj);
    var _this = this;

    // 如果设置了title，那么获取出来后删除该属性，因为该属性很特殊
    if (this.obj.attr("title")) {
        this.title = this.obj.attr("title");
        this.obj.removeAttr("title");
    }

    // 获取样式，因为在这里设置宽高
    this.style = this.obj.attr("style") ? this.obj.attr("style") : this.style;
    this.onafterclose = this.obj.attr("onafterclose") ? this.obj.attr("onafterclose") : null;

    // 如果存在按钮栏，那么解析出来
    this.buttons = [];
    this.obj.find(".buttons > button").each(function () {
        _this.buttons.push({
            id: $(this).attr("id"),
            text: $(this).text(),
            onclick: this.onclick,
            stress: $(this).attr("stress") ? true : false
        });
    });
    // 删除按钮列表
    this.obj.find(".buttons").remove();

    // 将内容保存起来
    this.body = this.obj.children();

    this.draw();
};

/**
 * 对话框初始化
 */
hait.dialog.Dialog.prototype.draw = function () {

    // 调用父级的同名方法
    this.father(hait.base.Component, "draw");

    var _this = this;

    // 如果不存在，那么按id创建一个
    if (this.obj == null) {
        this.obj = $("<div id='dialog_" + this.id + "'></div>");
        $(document.body).append(this.obj);
    }

    // 创建遮罩层
    this._background = $('<div id="dialog_shadow_' + this.id + '" class="hait-dialog-shadow"></div>');
    // 为该遮罩层定义zindex
    var zIndex = $(".hait-dialog-shadow").size() + $(".hait-dialog").size();
    this._background.css("z-index", zIndex + 1);
    $(document.body).append(this._background);

    // 强制设置样式
    this.obj.attr("class", "hait-dialog");

    // 如果存在样式，那么进行设置
    if (this.style) {
        this.obj.attr("style", this.style);
    }

    // 为对话框增加zindex
    this.obj.css("z-index", zIndex + 10);

    // 对这个对象进行对话框改造，添加head和body
    this.obj.prepend("<div id=\"dialog_title_" + this.id + "\" class=\"dialog-title-bar\"><div class=\"dialog-title\"></div><div class=\"icon icon-gray-close\"></div></div>");
    this.obj.append('<div class="dialog-body"></div>');
    this.obj.append('<div class="cls"></div>');

    this.obj.find(".dialog-title").html(this.title);
    this.obj.find(".dialog-body").css("padding", "16px");
    // 如果内容不为空，那么就添加
    if (this.body) {
        this.obj.find(".dialog-body").append(this.body);
    }
    var objHeight = this.obj.height();
    var bodyHeight = $("body").height();
    if(objHeight > bodyHeight){
        this.obj.css("height", bodyHeight);
    }

    // 动态设置body的高度
    this.obj.find(".dialog-body").height(this.obj.height() - 101);

    // 为关闭按钮增加关闭事件
    this.obj.find(".icon-gray-close").click(function () {
        _this.hide();
        // 如果设置了关闭事件，那么调用
        if (_this.onafterclose) {
            _this.trigger(_this.onafterclose);
        }
    });

    // 将配置的按钮增加到按钮栏
    if (this.buttons && this.buttons.length > 0) {
        this.obj.find(".dialog-body").height(this.obj.height() - 152);
        this.obj.append('<div class="dialog-bottom-bar"></div>');
        for (var i = 0; i < this.buttons.length; i++) {
            var button = this.buttons[i];
            var buttonDom = $('<button class="hait-button">' + button.text + '</button>');
            if (button.id) {
                buttonDom.attr("id", button.id);
            }
            // 为按钮增加事件
            if (button.text == "关闭" || button.text == "取消") {
                buttonDom.click(function () {
                    _this.hide();
                    // 如果设置了关闭事件，那么调用
                    if (_this.onafterclose) {
                        _this.trigger(_this.onafterclose);
                    }
                });
            } else if (button.onclick) {
                buttonDom.click(button.onclick);
            }
            if (button.stress) {
                buttonDom.addClass("stress");
            }
            this.obj.find(".dialog-bottom-bar").append(buttonDom);
        }
    }
};

hait.dialog.Dialog.prototype.show = function () {

    //为title增加鼠标拖动事件
    var obox = document.getElementById("body");
    console.log(obox);
    var odragTitle = document.getElementById("dialog_title_" + this.id);
    var odrag = document.getElementById(this.id);
    var flag = false;
    var x, y;
    var ol, ot;
    odragTitle.onmousedown = function (ev) {
        var ev = window.event || ev;
        flag = true;
        x = ev.clientX;
        y = ev.clientY;
        ol = odrag.offsetLeft;
        ot = odrag.offsetTop;
    }
    document.onmousemove = function (ev) {
        if (flag == false) return;
        var ev = window.event || ev;
        var _x, _y;
        _x = ev.clientX - x + ol;
        _y = ev.clientY - y + ot;
        if (_x < 0) _x = 0;
        if (_y < 0) _y = 0;
        if (_x > obox.offsetWidth - odrag.offsetWidth + 12) _x = obox.offsetWidth - odrag.offsetWidth + 12;
        if (_y > obox.offsetHeight - odrag.offsetHeight + 22) _y = obox.offsetHeight - odrag.offsetHeight + 22;

        odrag.style.left = _x + "px";
        odrag.style.top = _y + "px";
    }
    document.onmouseup = function () {
        flag = false;
    }

    // 重新计算对话框应该所在的位置
    this.obj.css("left", ($(window).width() - this.obj.width()) / 2 + $(document).scrollLeft());
    this.obj.css("top", ($(window).height() - this.obj.height()) / 2 + $(document).scrollTop());
    this._background.css("width", "100%");
    this._background.css("height", "100%");
    this._background.show();
    this.obj.fadeIn("fast");
};

hait.dialog.Dialog.prototype.hide = function () {
    this.obj.fadeOut("fast");
    this._background.hide();
};

/**
 * 判断是否展示着
 */
hait.dialog.Dialog.prototype.isDisplay = function () {
    if (this.obj.css("display") == "none") {
        return false;
    } else if (this.obj.css("display") == "block") {
        return true;
    } else {
        // 如何没有该项，那么表示显示
        return true;
    }
};

/**
 * 删除这个对话框对象
 */
hait.dialog.Dialog.prototype.remove = function () {
    // 调用父级的同名方法
    this.father(hait.base.Component, "remove");
    // 再执行自身需要的内容
    this._background.remove();
};

/**
 * 为对话框设置标题
 *
 * @param title
 */
hait.dialog.Dialog.prototype.setTitle = function (title) {
    this.title = title;
    this.obj.find(".dialog-title").html(title);
};