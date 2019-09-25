/**
 * SearchTextField对象，输入查询组件 在输入数据的同时查询后台数据
 * 
 * @author pandong
 * @date 2016-10-30 下午19:37:30
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.form.field");

hait.register("hait.form.Field");

/**
 * SearchTextField对象构造方法
 */
hait.form.field.SearchTextField = function() {

	/**
	 * 模式，有两种情况：func,url
	 */
	this.mode = "func";

	/**
	 * 下拉选项值数组
	 */
	this.options = [];

	/**
	 * 目标服务器
	 */
	this.server = "DEFAULT_SERVER";

	/**
	 * mode为func时的相关参数
	 */
	this.funcId = null;
	this.params = null;
	this.optionValue = null;
	this.optionText = null; // 显示项，多个用逗号隔开
	this.auto = true; // 是否自动获取数据

	/**
	 * 查询字段，默认为optionValue
	 */
	this.search = null;

	/**
	 * 当输入框内的内容达到此长度时，才进行查询，默认为1
	 */
	this.searchStart = 1;

	/**
	 * 不管是否存在返回数据，总是进行查询操作，默认为false
	 */
	this.alwaysQuery = false;

	/**
	 * mode为url时的相关参数
	 */
	this.url = null;

	/**
	 * 放置事件对象
	 */
	this.onchange = null; // 选择变更事件
	this.onrefresh = null; // 完成刷新后执行的事件
	this.onload = null; // 下拉数据初始化完毕时间
	this.onparam = null; // 当拼装查询参数时

	/**
	 * 私有属性
	 */
	this._displayInput = null; // 延迟值
	this._displayValue = null; // 显示值
	this._noNeedToQuery = false; // 没有必要再查询
	this._noNeedToQueryCount = -1; // 没有必要再查询时的值长度
	this._prevValue = null; // 前一个值
	this._prevDisplayValue = null; // 前一个显示值
	this._curOption = null; // 当前选项的json对象
};

// 继承于hait.form.Field对象
hait.form.field.SearchTextField.inherit(hait.form.Field);

/**
 * 这个方法是将页面中的对象转换为hait对象
 */
hait.form.field.SearchTextField.prototype.convert = function(obj) {

	// 调用父级方法convert
	this.father(hait.form.Field, "convert", obj);

	// 初始化特殊属性
	this.mode = this.obj.attr("mode") ? this.obj.attr("mode") : "func";
	this.server = this.obj.attr("server") ? this.obj.attr("server") : "DEFAULT_SERVER";

	// 初始化事件
	this.onchange = this.obj.attr("onchange") ? this.obj.attr("onchange") : null;
	this.onrefresh = this.obj.attr("onrefresh") ? this.obj.attr("onrefresh") : null;
	this.onload = this.obj.attr("onload") ? this.obj.attr("onload") : null;
	this.onparam = this.obj.attr("onparam") ? this.obj.attr("onparam") : null;

	// 根据mode类型初始化其他特殊属性
	if (this.mode == "func") {
		this.funcId = this.obj.attr("func-id") ? this.obj.attr("func-id") : null;
	} else if (this.mode == "url") {
		this.url = this.obj.attr("url") ? this.obj.attr("url") : null;
	}
	this.params = this.obj.attr("params") ? hait.parseParam(this.obj.attr("params")) : {};
	this.params.funcId = this.funcId;
	this.optionValue = this.obj.attr("option-value") ? this.obj.attr("option-value") : "val";
	this.optionText = this.obj.attr("option-text") ? this.obj.attr("option-text") : this.optionValue;
	this.search = this.obj.attr("search") ? this.obj.attr("search") : this.optionValue;
	this.searchStart = this.obj.attr("search-start") ? this.obj.attr("search-start") : 1;
	this.alwaysQuery = this.obj.attr("always-query") ? true : false; // 只要设置了就是真
	this.auto = this.obj.attr("auto") && this.obj.attr("auto") == "false" ? false : true;

	// 参数初始化完毕，然后交给draw方法进行绘制
	this.draw();
};

/**
 * 直接绘制对象
 * 
 * @param obj
 */
hait.form.field.SearchTextField.prototype.draw = function() {

	// 调用父级方法convert
	this.father(hait.form.Field, "draw");

	// 开始拼装新的对象
	var container = $("<div class='hait-select' id='select-" + this.id + "'></div>");

	// 如果存在obj，那么表示是从convert过来了
	if (this.obj) {
		// 将这个封装好的对象放置到目标对象前面
		this.obj.before(container);
		// 删除原始对象，并重新赋值
		this.obj.remove();
	}

	this.obj = container;

	// 如果外部设置了样式，那么直接设置进去
	if (this.style) {
		this.obj.attr("style", this.style);
	}

	// 填充HTML和数据
	this._fillHtml();

	if (this.required) {
		this.obj.attr("required", this.required);
		this._displayInput.attr("required", this.required);
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

	// draw方法执行完毕，则表示该对象已经load完毕
	if (this.onload) {
		this.trigger(this.onload, this);
	}
};

/**
 * 默认的getValue操作
 */
hait.form.field.SearchTextField.prototype.getValue = function() {
	// 在内部操作中会随时将值写入该属性中
	return this.value;
};

/**
 * 默认的setValue操作
 * 
 * @param val
 */
hait.form.field.SearchTextField.prototype.setValue = function(val) {
	this.value = val;
	// 进行设置显示值
	this._displayInput.val(val);
};

/**
 * 设置只读
 * 
 * @param isReadonly
 */
hait.form.field.SearchTextField.prototype.setReadonly = function(isReadonly) {
	this.father(hait.form.Field, "setReadonly", isReadonly);
	if (this.readonly) {
		this._displayInput.attr("readonly", true);
	} else {
		this._displayInput.removeAttr("readonly");
	}
};

/**
 * 设置禁用
 * 
 * @param isDisabled
 */
hait.form.field.SearchTextField.prototype.setDisabled = function(isDisabled) {
	this.father(hait.form.Field, "setDisabled", isDisabled);
	if (this.disabled) {
		this._displayInput.attr("disabled", true);
		this.obj.attr("disabled", true);
	} else {
		this._displayInput.removeAttr("disabled");
		this.obj.removeAttr("disabled");
	}
};

hait.form.field.SearchTextField.prototype.reset = function() {
	// 清除当前输入框的值
	this.value = null;
	this._displayInput.val("");
	this._noNeedToQuery = false;
};

/**
 * 内部方法，根据设置获取数据的方法
 * 
 * @private
 */
hait.form.field.SearchTextField.prototype._getData = function() {
	var _this = this;

	// 如果当前内容长度等于查询开始长度，那么必然进行查询
	if (this._displayInput.val().length == this.searchStart) {
		this._noNeedToQuery = false;
		this._noNeedToQueryCount = -1;
	}

	// 如果当前没有必要查询标志为真，那么就不进行查询
	if (this._noNeedToQuery) {
		if (this._noNeedToQueryCount <= this.value.length && !this.alwaysQuery) {
			// 如果不查询标志为真，而且不查询当时的内容长度比当前长度小，并且不允许总是查询，则不进行查询
			return;
		} else {
			// 反之，则重置，允许查询
			this._noNeedToQuery = false;
			this._noNeedToQueryCount = -1;
		}
	}

	// 根据mode类型初始化其他特殊属性
	if (this.mode == "func") {
		this.params = this.params ? this.params : {};
		this.params.funcId = this.funcId;
		request({
			server : _this.server,
			data : [ _this.params ],
			async : false,
			func : function(data) {
				_this._analyzeRemoteResult(data);
				_this._fillOption();
			}
		});
	} else if (this.mode == "url") {
		// 通过远程访问获取数据
		$.post(_this.url, _this.params, function(data) {
			_this._analyzeRemoteResult(data);
			_this._fillOption();
		}, "json");
	}
};

/**
 * 
 * 远程请求的回调函数
 */
hait.form.field.SearchTextField.prototype._analyzeRemoteResult = function(data) {
	var response = data.responses[0];

	// 如果发生了错误,弹出对话框进行提示
	if (response.flag <= 0) {
		alert(response.message);
		return;
	}

	this.options = [];
	var items = response.items;
	if (items == null || items.length < 1) {
		// 如果查不到数据，就设置不需要在查询
		this._noNeedToQuery = true;
		this._noNeedToQueryCount = this.value.length;
		return;
	}

	// 设置可以继续查询
	this._noNeedToQuery = false;
	// 设置下拉列表值
	this.options = items;
};

/**
 * 内部方法,填充总体html
 * 
 * @private
 */
hait.form.field.SearchTextField.prototype._fillHtml = function() {
	var _this = this;
	this._displayInput = $("<input type='text' class='select-show-text'/>");

	// 设置不允许输入的内容
	this._displayInput.keydown(function() {
		// 不允许输入单引号
		if (event.keyCode == 222) {
			return false;
		}
	});

	// 失去焦点时，需要隐藏下拉框
	this._displayInput.focusout(function() {
		// 如果禁用了，就不用做任何处理
		if (_this.disabled || _this.readonly) {
			return false;
		}
		
		// 延迟一定的时间触发，确保点击选项正常进行
		window.setTimeout(function() {
			// 如果下拉框是显示状态，那么就隐藏
			if (_this.obj.find(".select-items").css("display") == "block") {
				_this.obj.find(".select-items").hide();
			}
			// 执行onchange事件
			var prevCompareValue = _this._prevValue + "-" + _this._prevDisplayValue;
			var nowCompareValue = _this.value + "-" + _this._displayValue;
			if (_this.onchange && prevCompareValue != nowCompareValue) {
				// 当配置了事件对象，并且新值不等于旧值的时候触发
				_this.trigger(_this.onchange, _this, _this._prevValue, _this.value, _this._curOption);
			}
		}, 300);
	});

	// 设置keyup事件
	this._displayInput.keyup(function() {
		// 如果存在特殊字符处理，那么就不再向下处理
		if (_this._specialKeyCode(window.event.keyCode)) {
			return;
		}

		// 获取当前输入框的内容
		_this.value = _this._displayInput.val();
		_this._displayValue = null; // 清除显示值
		_this._curOption = null; // 清除选项json

		// 如果为空，直接返回
		if (_this.value == null || _this.value.length == 0) {
			return;
		}

		// 如果长度不够，也不进行任何操作
		if (_this.value.length < _this.searchStart) {
			return;
		}

		// 如果有值，那么到后台去获取数据
		if (_this.params == null) {
			_this.params = {};
		}
		
		if(_this.onparam) {
			// 如果存在参数拼装事件，那么根据结果设置请求参数
			_this.params = _this.trigger(_this.onparam, _this, _this.value);
		}else{
			// 将当前值设置为查询字段
			_this.params[_this.search] = _this.value;
		}
		
		// 获取数据
		_this._getData();
		return;
	});

	// 如果设置占位符,那么添加
	if (this.placeholder) {
		this._displayInput.attr("placeholder", this.placeholder);
	}

	this._displayInput.css("width", "98%");
	this._displayInput.css("padding-right", "0px");

	// 添加这些元素
	this.obj.append(this._displayInput);
	this.obj.append("<ul class='select-items'></ul>");
	// 设置下拉对象的特殊样式
	this.obj.find(".select-items").css("max-height","300px");
	this.obj.find(".select-items").css("overflow","hidden");
};

/**
 * 内部方法,填充下拉部分的html
 * 
 * @private
 */
hait.form.field.SearchTextField.prototype._fillOption = function() {

	// 获得下拉列表
	var selectItems = this.obj.find(".select-items");
	selectItems.empty();

	// 如果没有任何内容，就直接返回
	if (this.options == null || this.options.length == 0) {
		selectItems.hide();
		return;
	}

	var _this = this;

	for (var i = 0; i < this.options.length; i++) {
		var option = this.options[i];
		var optionValue = option[this.optionValue];
		var optionText = this._getOptionText(option);
		var selectItem = $("<li></li>");
		selectItem.attr("val", optionValue);
		selectItem.append(optionText);
		// 将当前值保存起来，供以后使用
		selectItem.data("option", JSON.stringify(option));
		selectItems.append(selectItem);

		// 下拉选项的点击事件
		selectItem.click(function() {
			// 保存当前值为上一个值
			_this._prevValue = _this.value;
			_this._prevDisplayValue = _this._displayValue;

			// 当前样式更新
			_this.obj.find(".selected").removeClass("selected");
			$(this).addClass("selected");
			// 获取新的值和显示值
			_this.value = $(this).attr("val");
			// 保存当前选项option
			_this._curOption = $.parseJSON(_this.obj.find(".selected").data("option"));
			// 获得显示值
			_this._displayValue = _this._getOptionText(_this._curOption);

			// 将值写入输入框
			_this._displayInput.val(_this.value);
			_this.obj.find(".select-items").hide();
		});
	}

	// 显示列表
	selectItems.show();

	// 每次刷新完成后，调用相应事件
	if (this.onrefresh) {
		this.trigger(this.onrefresh, this);
	}
};

/**
 * 特殊keyCode处理
 * 
 * @param keyCode
 * @returns {Boolean} true 已处理 false 未处理
 */
hait.form.field.SearchTextField.prototype._specialKeyCode = function(keyCode) {
	var _this = this;
	var selectItems = _this.obj.find(".select-items");
	if (keyCode == "38") {
		// 向上的按钮
		var curSelectItem = selectItems.find(".selected");
		// 如果没有选中项目，就直接返回
		if (curSelectItem.size() == 0) {
			return true;
		}
		// 如果是第一个了，就什么也不做
		if (curSelectItem.index() == 0) {
			return true;
		}
		// 将选中项目，向前移动
		var nextSelectItem = curSelectItem.prev();
		nextSelectItem.addClass("selected");
		curSelectItem.removeClass("selected");

		// 保存当前值为上一个值
		_this._prevValue = _this.value;
		_this._prevDisplayValue = _this._displayValue;

		// 保存当前值
		var curOptionData = nextSelectItem.data("option");
		_this.value = nextSelectItem.attr("val");// 对当前对象进行赋值
		_this._curOption = $.parseJSON(curOptionData);// 获得当前选项的option
		_this._displayValue = _this._getOptionText(_this._curOption);// 获得显示值
		// 将值设置到输入框中
		_this._displayInput.val(_this.value);
		return true;
	} else if (keyCode == "40") {
		// 首先判断是否存在数据，如果不存在，那么什么就别做
		if(_this.options == null || _this.options.length == 0) {
			return true;
		}
		// 向下的按钮
		var curSelectItem = selectItems.find(".selected");
		var nextSelectItem = selectItems.find("li:first");
		if (curSelectItem.size() > 0) {
			// 如果是最后一个，就不做任何操作
			if(curSelectItem.index() == selectItems.find("li").size() - 1) {
				return true;
			}
			// 如果不是，那么选取下一个
			nextSelectItem = curSelectItem.next();
			curSelectItem.removeClass("selected");
		}
		nextSelectItem.addClass("selected");
		// 显示下拉框
		selectItems.show();

		// 保存当前值为上一个值
		_this._prevValue = _this.value;
		_this._prevDisplayValue = _this._displayValue;

		// 保存当前值
		var curOptionData = nextSelectItem.data("option");
		_this.value = nextSelectItem.attr("val");// 对当前对象进行赋值
		_this._curOption = $.parseJSON(curOptionData);// 获得当前选项的option
		_this._displayValue = _this._getOptionText(_this._curOption);// 获得显示值
		// 将值设置到输入框中
		_this._displayInput.val(_this.value);
		return true;
	} else if (keyCode == "13") {
		// 回车的按钮，关闭下拉框即可
		selectItems.hide();
		return true;
	}

	return false;
};

/**
 * 获取option中的显示值
 */
hait.form.field.SearchTextField.prototype._getOptionText = function(option) {
	var optionText = "";
	if (this.optionText.indexOf(",") >= 0) {
		var optionTextArr = this.optionText.split(",");
		for (var j = 0; j < optionTextArr.length; j++) {
			optionText += option[optionTextArr[j]] + ",";
		}
		if (optionText != null && optionText.length > 0) {
			optionText = optionText.substring(0, optionText.length - 1);
		}
	} else {
		optionText = option[this.optionText];
	}
	return optionText;
};