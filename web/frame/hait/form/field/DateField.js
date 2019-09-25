/**
 * DateField对象，普通输入框
 * 
 * @author pandong
 * @date 2013-03-04 下午18:44:47
 * @Copyright(c) htsoft.com
 */

hait.namespace("hait.form.field");

hait.register("hait.form.Field");

hait.addHead(BASE_PATH + "/frame/plugins/datepicker/datepicker.js");
hait.addHead(BASE_PATH + "/frame/plugins/datepicker/datepicker.css");

/**
 * DateField对象构造方法
 */
hait.form.field.DateField = function() {
	/**
	 * 日期格式
	 * yyyy-MM-dd hh:mm:ss.S
	 * yyyy-M-d h:m:s.S
	 */
	this.format = "yyyy-MM-dd";

	/**
	 * 可选择的开始日期
	 */
	this.startDate = null;

	/**
	 * 可选择的结束日期
	 */
	this.endDate = null;
	
	/**
	 * 放置事件对象
	 */
	this.onchange = null; // 选择变更事件

	/**
	 * 私有属性
	 */
	this._valueInput = null; // 内部的时间输入框
	this._selectBtn = null; // 时间点击按钮
	this._isInitComplete = false; // 是否已经初始化完毕
	this._delayValue = null;// 延迟值（用于初始化未完成时的赋值操作）
	this._intervalId = null; // 初始化轮训方法
};

// 继承于hait.form.Field对象
hait.form.field.DateField.inherit(hait.form.Field);

hait.form.field.DateField.prototype.convert = function(obj) {

	// 调用父级方法convert
	this.father(hait.form.Field, "convert", obj);

	// 获取格式化字符串
	this.format = this.obj.attr("format") ? this.obj.attr("format") : this.format;
	this.defaultValue = this.obj.attr("value") ? this.obj.attr("value") : null;
	this.startDate = this.obj.attr("start-date") ? this.obj.attr("start-date") : null;
	this.endDate = this.obj.attr("end-date") ? this.obj.attr("end-date") : null;
	
	// 初始化事件
	this.onchange = this.obj.attr("onchange") ? this.obj.attr("onchange") : null;

	// 参数初始化完毕，交给绘制对象进行绘制
	this.draw();
};

hait.form.field.DateField.prototype.draw = function() {
	var _this = this;

	// 调用父级方法convert
	this.father(hait.form.Field, "draw");
	var container = $('<div class="hait-select"></div>');

	// 如果此时obj对象存在，那么说明是convert方法过来的
	if (this.obj) {
		// 将这个容易放置在obj的旁边
		this.obj.before(container);
		// 删除当前对象
		this.obj.remove();
	}

	this.obj = container;

	// 创建时间输入框
	this._valueInput = $('<input type="text" class="select-show-text"/>');
	
	if(this.placeholder != null && this.placeholder.length > 0){
		this._valueInput.attr("placeholder", this.placeholder);
	}
	
	// 创建点击按钮
	this._selectBtn = $('<div class="select-button"><div class="icon icon-black-date"></div></div>');

	// 添加到基础元素中
	this.obj.append(this._valueInput);
	this.obj.append(this._selectBtn);

	// 如果设置样式，那么自动写入最外层的样式
	if (this.style) {
		this.obj.attr("style", this.style);
	}

	// 开始轮训方法，直到对象正常创建
	this._intervalId = window.setInterval(function() {
		// 如果没有初始化完毕，直接返回
		if (_this._valueInput.datepicker == undefined) {
			return;
		}
		// 设置初始化完成标志
		_this._isInitComplete = true;
		window.clearInterval(_this._intervalId);

		// 初始化参数
		var initParams = {
			autoHide : true
		};
		if (_this.startDate) {
			initParams["startDate"] = _this.startDate;
		}
		if (_this.endDate) {
			initParams["endDate"] = _this.endDate;
		}

		// 进行初始化
		_this._valueInput.datepicker(initParams);

		// 如果有延迟值，那么进行设置
		if (_this._delayValue) {
			_this.setValue(_this._delayValue);
		}
	}, 100);

	// 设置打开事件
	this._valueInput.on('show.datepicker', function(e) {
		if (_this.readonly || _this.disabled) {
			return false;
		}
	});
	
	// 每次选择后，都记录相应的值
	this._valueInput.on('pick.datepicker', function(e) {
		// 如果为空，表示为清空处理
		if(e.date == null){
			_this.value = null;
			return;
		}
		var prevValue = _this.value;
		_this.value = e.date.format(_this.format);
		if(_this.onchange && prevValue != _this.value) {
			// 当配置了事件对象，并且新值不等于旧值的时候触发
			_this.trigger(_this.onchange, _this, prevValue, _this.value);
		}
	});

	// 按钮点击事件
	this._selectBtn.click(function() {
		// 如果禁用或只读,那么点击无效
		if (_this.readonly || _this.disabled) {
			return;
		}

		_this._valueInput.datepicker("show");
		event.stopPropagation();
	});
	
	if((this.placeholder == null || this.placeholder.length == 0) && (this.defaultValue == null || this.defaultValue.length == 0)){
		// 默认值和占位符都为空，才设置当前时间为今日
		this.defaultValue = new Date().format(this.format);
	}

	// 完毕后，如果设置了初始化值，那么就相应设置
	if (this.defaultValue && this.defaultValue.length > 0) {
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
hait.form.field.DateField.prototype.getValue = function() {
	// 如果没有加载完成，直接返回空
	if (!this._isInitComplete) {
		return null;
	}
	return this.value;
};

/**
 * 实现setValue操作
 * 
 * @param val
 */
hait.form.field.DateField.prototype.setValue = function(val) {
	// 表示没有加载完成,将值保存起来,等待加载完成后再添加
	if (!this._isInitComplete) {
		this._delayValue = val;
		return false;
	}
	if(val == null || val.length == 0){
		this._valueInput.datepicker("reset");
		this.value = null;
		return;
	}
	
	// 如果传入值太长，那么裁剪为能够认识的模式2016-11-24
	val = val.length > 10 ? val.substring(0, 10) : val;
	this.value = val;
	this._valueInput.datepicker("setDate", val);
};

/**
 * 设置只读
 * 
 * @param isReadonly
 */
hait.form.field.DateField.prototype.setReadonly = function(isReadonly) {
	this.father(hait.form.Field, "setReadonly", isReadonly);
	if (this.readonly) {
		this._valueInput.attr("readonly", true);
	} else {
		this._valueInput.removeAttr("readonly");
	}
};

/**
 * 设置禁用
 * 
 * @param val
 * @returns
 */
hait.form.field.DateField.prototype.setDisabled = function(isDisabled) {
	this.father(hait.form.Field, "setDisabled", isDisabled);
	if (this.disabled) {
		this._valueInput.attr("disabled", true);
		this.obj.attr("disabled", true);
	} else {
		this._valueInput.removeAttr("disabled");
		this.obj.removeAttr("disabled");
	}
};