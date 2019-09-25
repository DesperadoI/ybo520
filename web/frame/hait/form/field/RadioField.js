/**
 * RadioField对象，复选框
 * 
 * @author pandong
 * @date 2016-09-11 下午18:44:47
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.form.field");

hait.register("hait.form.Field");

/**
 * RadioField对象构造方法
 */
hait.form.field.RadioField = function() {
	/**
	 * 放置事件对象
	 */
	this.onclick = null; // 点击事件
};

// 继承于hait.form.Field对象
hait.form.field.RadioField.inherit(hait.form.Field);

/**
 * 通过原始Element对象转换
 * 
 * @param obj
 */
hait.form.field.RadioField.prototype.convert = function(obj) {
	
	// 调用父级方法convert
	this.father(hait.form.Field, "convert", obj);

	// 初始化事件
	this.onclick = this.obj.attr("onclick") ? this.obj.attr("onclick") : null;

	this.draw();
};

/**
 * 直接创建的方法
 */
hait.form.field.RadioField.prototype.draw = function() {
	var _this = this;
	// 调用父级方法convert
	this.father(hait.form.Field, "draw");

	var container = $("<label><input type='radio' id='input_radio_" + this.id + "'/>" + this.text + "</label>");
	
	// 如果this.obj为空，那么表示是直接调的draw
	if (this.obj != null) {
		this.obj.after(container);
		this.obj.remove();
	}
	
	this.obj = container;

	if (this.required) {
		this.obj.find("input").attr("required", this.required);
	}
	
	// 如果配置了点击事件，那么增加该事件
	if (this.onclick) {
		this.obj.find("input").click(function(){
			_this.trigger(_this.onclick, _this, this.checked);
		});
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
hait.form.field.RadioField.prototype.getValue = function() {
	this.value = this.isChecked() ? 1 : 2; // 设置返回值
	return this.value;
};

/**
 * 是否选中
 * @returns
 */
hait.form.field.RadioField.prototype.isChecked = function() {
	return this.obj.find("input")[0].checked;
};

/**
 * 实现setValue操作
 * 
 * @param val
 */
hait.form.field.RadioField.prototype.setValue = function(val) {
	this.value = val;
	switch (parseInt(this.value)) {
	case 1:
		this.obj.find("input").attr("checked", "checked");
		break;
	case 2:
		this.obj.find("input").removeAttr("checked");
		break;
	}
};

hait.form.field.RadioField.prototype.setReadonly = function(isReadonly) {
	this.father(hait.form.Field, "setReadonly", isReadonly);
	if(this.readonly){
		this.obj.click(function(){
			return false;
		});
	}else{
		this.obj.unbind("click");
	}
};

hait.form.field.RadioField.prototype.setDisabled = function(isDisabled) {
	this.father(hait.form.Field, "setDisabled", isDisabled);
	if (this.disabled) {
		this.obj.find("input").attr("disabled", true);
	} else {
		this.obj.find("input").removeAttr("disabled");
	}
};