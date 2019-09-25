/**
 * MagnifierField对象，放大镜对话框
 *
 * @author pandong
 * @date 2013-03-17 下午18:44:47
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.form.field");

hait.register("hait.form.Field");
hait.register("hait.dialog.Dialog");

/**
 * MagnifierField对象构造方法
 */
hait.form.field.MagnifierField = function () {

    /**
     * 目标页面地址
     */
    this.url = null;

    /**
     * 显示的值
     */
    this.displayValue = null;
    
    /**
     * 显示的后台绑定值
     */
    this.displayName = null;

    /**
     * 对话框标题
     */
    this.dialogTitle = null;

    /**
     * 对话框的样式，一般用于设置宽高
     */
    this.dialogStyle = "width:500px;height:450px";

    /**
     * 对话框关闭后的回调事件
     */
    this.ondialogclose = null;

    /**
     * 私有属性
     */
        // 下拉窗口对象
    this._dialog = null;
    // 本身的iframe对象
    this._iframe = null;
};

// 继承于hait.form.field.Field对象
hait.form.field.MagnifierField.inherit(hait.form.Field);

/**
 * 通过原始Element对象转换
 *
 * @param obj
 */
hait.form.field.MagnifierField.prototype.convert = function (obj) {
    // 初始化基本属性
    this.father(hait.form.Field, "convert", obj);

    // 读取该对象的扩展属性
    this.url = this.obj.attr("url") ? this.obj.attr("url") : null;
    this.displayName = this.obj.attr("display_name") ? this.obj.attr("display_name") : null;
    this.displayValue = this.obj.attr("display_value") ? this.obj.attr("display_value") : null;
    this.dialogTitle = this.obj.attr("dialog-title") ? this.obj.attr("dialog-title") : "放大镜组件";
    this.dialogStyle = this.obj.attr("dialog-style") ? this.obj.attr("dialog-style") : "width:600px;height:450px";
    
    // 获取事件
    this.ondialogclose = this.obj.attr("ondialogclose") ? this.obj.attr("ondialogclose") : null;

    // 绘制该对象
    this.draw();
};

/**
 * 直接创建的方法
 */
hait.form.field.MagnifierField.prototype.draw = function () {

    // 调用父级方法convert
    this.father(hait.form.Field, "draw");
    var _this = this;

    // 将这个封装好的对象放置到目标对象前面
    var container = $('<div id="inputMagnifier' + this.id + '" class="hait-select"></div>');

    // 如果存在obj，那么删除当前obj对象
    if (this.obj != null) {
        this.obj.before(container);
        this.obj.remove();
    }

    this.obj = container;

    if (this.style) {
        this.obj.attr("style", this.style);
    }

    // 添加文字显示
    this.obj.append('<input type="text" class="select-show-text" value="请选择..." readonly/>');

    // 设置必录入项
    if (this.required) {
        this.obj.find("input[type=text]").attr("required", true);
    }

    // 初始化下拉选项按钮
    var selectBtn = $('<div class="select-button"><div class="icon icon-black-magnifier"></div></div>');
    this.obj.append(selectBtn);
    this.obj.click(function () {
        if (_this.disabled || _this.readonly) {
            return false;
        }
        // 显示和隐藏下拉框
        _this._dialog.show();
        event.stopPropagation();
    });
    
    // 获得token
	var token = hait.cookie.get("token");
	if (token == null || token.length == 0) {
		token = window.localStorage["token"];
	}
	
    // 拼装真实的url
	var iframeUrl = this.url + (this.url.indexOf("?") >= 0 ? "&" : "?") + "token=" + token;
	iframeUrl += "&r=" + new Date().getTime();

    // 创建iframe
    var iframeId = "inputMagnifier" + this.id + "Iframe";
    this._iframe = $('<iframe id="' + iframeId + '" name="' + iframeId + '" width="100%" height="100%" frameborder="0" src="' + iframeUrl
        + '"></iframe>');

    // 权限对话框
    this._dialog = new hait.dialog.Dialog();
    this._dialog.setParam({
        title: _this.dialogTitle ? _this.dialogTitle : "放大镜",
        style: _this.dialogStyle,
        body: _this._iframe,
        buttons: [{
            text: "关闭"
        }, {
            text: "确定",
            stress: true,
            onclick: function () {
                // 成功后的操作
                var resultValue = null;
                if (_this._iframe[0].contentWindow.getValue) {
                    resultValue = _this._iframe[0].contentWindow.getValue();
                }
                // 封装显示和值
                if (resultValue == null) {
                    _this._dialog.hide();
                    return;
                }

                // 如果存在返回方法，调用返回方法
                if (_this.ondialogclose) {
                	resultValue = _this.trigger(_this.ondialogclose, resultValue);
                }
                
                if(resultValue == null){
                	alert("对话框关闭后的回调事件返回值为空，请检查");
                	return;
                }
                
                // 设置返回值到当当前组件
                _this.setValue(resultValue.val);
                _this.setDisplayValue(resultValue.text);
                _this._dialog.hide();
            }
        }]
    });
    this._dialog.draw();

    // 完毕后，如果设置了初始化值，那么就相应设置
    if (this.defaultValue) {
        this.setValue(this.defaultValue);
    }
    
    if (this.displayValue) {
        this.setDisplayValue(this.displayValue);
    }

    if (this.readonly) {
        this.setReadonly(this.readonly);
    }

    if (this.disabled) {
        this.setDisabled(this.disabled);
    }
};

/**
 * 默认的getValue操作
 */
hait.form.field.MagnifierField.prototype.getValue = function () {
    return this.value;
};
hait.form.field.MagnifierField.prototype.getDisplayValue = function () {
    return this.displayValue;
};

/**
 * 默认的setValue操作
 *
 * @param val
 */
hait.form.field.MagnifierField.prototype.setValue = function (val) {
    this.obj.find("input[type=text]").val(val);
    this.value = val;
};

hait.form.field.MagnifierField.prototype.setDisplayValue = function (val) {
    this.obj.find("input[type=text]").val(val);
    this.displayValue = val;
};

/**
 * 变更内容URL
 *
 * @param url
 */
hait.form.field.MagnifierField.prototype.changeURL = function (url) {
    this._iframe.attr("src", url);
};

/**
 * 变更对话框标题
 * @param title
 */
hait.form.field.MagnifierField.prototype.setDialogTitle = function (title) {
    this._dialog.setTitle(title);
};

/**
 * 设置禁用
 *
 * @param val
 * @returns
 */
hait.form.field.MagnifierField.prototype.setDisabled = function (isDisabled) {
    this.father(hait.form.Field, "setDisabled", isDisabled);
    if (this.disabled) {
        this.obj.find("input[type=text]").attr("disabled", true);
    } else {
        this.obj.find("input[type=text]").removeAttr("disabled");
    }
};