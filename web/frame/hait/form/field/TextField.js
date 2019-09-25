/**
 * TextField对象，普通输入框
 *
 * @author pandong
 * @date 2013-03-03 下午18:44:47
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.form.field");

hait.register("hait.form.Field");

/**
 * TextField对象构造方法
 */
hait.form.field.TextField = function () {

};

// 继承于hait.form.Field对象
hait.form.field.TextField.inherit(hait.form.Field);

/**
 * 通过原始Element对象转换
 *
 * @param obj
 */
hait.form.field.TextField.prototype.convert = function (obj) {

    // 调用父级方法convert
    this.father(hait.form.Field, "convert", obj);

    // 输入框的默认值就是value值
    this.defaultValue = this.obj.attr("value") ? this.obj.attr("value") : null;

    this.draw();
};

/**
 * 直接创建的方法
 */
hait.form.field.TextField.prototype.draw = function () {

    // 调用父级方法convert
    this.father(hait.form.Field, "draw");

    // 如果this.obj为空，那么表示是直接调的draw
    if (this.obj == null) {
        this.obj = $("<input type='text' id='input_text_" + this.id + "'/>");
    }

    // 为控件设置样式，由于是输入框比较简单，直接设置参数即可
    this.obj.attr("class", "hait-input");

    // 如果设置样式，那么自动写入最外层的样式
    if (this.style) {
        this.obj.attr("style", this.style);
    }

    if (this.required) {
        this.obj.attr("required", this.required);
    }

    // 完毕后，如果设置了初始化值，那么就相应设置
    if (this.defaultValue) {
        this.setValue(this.defaultValue);
    }

    if (this.readonly) {
        this.setReadonly(this.readonly);
    }

    if (this.disabled) {
        this.setDisabled(this.disabled);
    }
};

/**
 * 实现getValue操作
 */
hait.form.field.TextField.prototype.getValue = function () {
    return this.obj.val();
};

/**
 * 实现setValue操作
 *
 * @param val
 */
hait.form.field.TextField.prototype.setValue = function (val) {
    this.obj.val(val);
};

hait.form.field.TextField.prototype.setReadonly = function (isReadonly) {
    this.father(hait.form.Field, "setReadonly", isReadonly);
    if (this.readonly) {
        this.obj.attr("readonly", true);
    } else {
        this.obj.removeAttr("readonly");
        ;
    }
};

hait.form.field.TextField.prototype.setDisabled = function (isDisabled) {
    this.father(hait.form.Field, "setDisabled", isDisabled);
    if (this.disabled) {
        this.obj.attr("disabled", true);
    } else {
        this.obj.removeAttr("disabled");
        ;
    }
};