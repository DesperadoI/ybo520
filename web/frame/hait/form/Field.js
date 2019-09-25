/**
 * Field对象，最基础的对象，是所有表单控件对象的父类
 * 
 * @author pandong
 * @date 2013-03-03 下午18:44:47
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.form");

/**
 * Field对象构造方法
 */
hait.form.Field = function() {

	/**
	 * 描述名称
	 */
	this.text = null;

	/**
	 * 字段名称
	 */
	this.name = null;
	
	/**
	 * 字段显示名称
	 */
	this.nameText = null;

	/**
	 * 类别
	 */
	this.type = null;

	/**
	 * 默认值
	 */
	this.defaultValue = null;

	/**
	 * 当前值
	 */
	this.value = null;

	/**
	 * 占位符
	 */
	this.placeholder = null;

	/**
	 * 是否必须
	 */
	this.required = false;

	/**
	 * 是否禁用
	 */
	this.disabled = false;

	/**
	 * 是否只读
	 */
	this.readonly = false;

	/**
	 * 正则表达式
	 */
	this.pattern = null;

	/**
	 * 当正则表达式没有验证通过时显示的提示
	 */
	this.patternMessage = null;

	/**
	 * 样式
	 */
	this.style = null;
};

// 继承于hait.base.Component对象
hait.form.Field.inherit(hait.base.Component);

/**
 * 初始化默认属性的方法，用于通过界面dom对象转换时候调用
 */
hait.form.Field.prototype.convert = function(obj) {
	// 调用父类同级方法
	this.father(hait.base.Component, "convert", obj);

	// 初始化自身方法
	this.name = this.obj.attr("name") ? this.obj.attr("name") : null;
	this.nameText = this.obj.attr("name-text") ? this.obj.attr("name-text") : null;
	this.type = this.obj.attr("hait-type") ? this.obj.attr("hait-type") : null;
	this.text = this.obj.attr("text") ? this.obj.attr("text") : null;
	this.defaultValue = this.obj.attr("default-value") ? this.obj.attr("default-value") : null;
	this.required = this.obj.attr("required") ? true : false;
	this.disabled = this.obj.attr("disabled") ? true : false;
	this.readonly = this.obj.attr("readonly") ? true : false;
	this.pattern = this.obj.attr("pattern") ? this.obj.attr("pattern") : null;
	this.patternMessage = this.obj.attr("pattern-message") ? this.obj.attr("pattern-message") : null;
	this.placeholder = this.obj.attr("placeholder") ? this.obj.attr("placeholder") : null;
	this.style = this.obj.attr("style") ? this.obj.attr("style") : null;
};

/**
 * getValue操作
 */
hait.form.Field.prototype.getValue = function() {
	return null;
};

/**
 * setValue操作
 * 
 * @param val
 */
hait.form.Field.prototype.setValue = function(val) {
};

/**
 * 设置只读，需要子类去实现
 * 
 * @param isReadonly
 */
hait.form.Field.prototype.setReadonly = function(isReadonly) {
	this.readonly = isReadonly && isReadonly != "false" ? true : false;
};

/**
 * 设置禁用，需要子类去实现
 * 
 * @param isDisabled
 */
hait.form.Field.prototype.setDisabled = function(isDisabled) {
	this.disabled = isDisabled && isDisabled != "false" ? true : false;
};

/**
 * 重置内容，需要子类去实现
 */
hait.form.Field.prototype.reset = function() {
	this.setValue(this.defaultValue ? this.defaultValue : "");
};

/**
 * 验证自身数据的方法
 * 
 * @returns
 */
hait.form.Field.prototype.validate = function() {
	// 设置了正则就进行验证
	if (this.pattern == null) {
		// 这种情况直接返回真即可
		return true;
	}

	var val = this.getValue();
	if (val == null) {
		// 如果当前值为空，那么赋值为空字符串
		val = "";
	}
	// 进行正则验证，并返回验证结果
	var regExp = new RegExp(this.pattern);
	return regExp.test(val);
};