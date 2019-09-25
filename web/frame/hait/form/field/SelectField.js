/**
 * SelectField对象，下拉菜单对象，分为单选还是复选
 * 
 * @author pandong
 * @date 2013-03-03 下午19:37:30
 * @Copyright(c) htsoft.com
 */

hait.namespace("hait.form.field");

hait.register("hait.form.Field");

hait.resource(BASE_PATH + "/frame/plugins/jquery/jquery.md5.js");

/**
 * SelectField对象构造方法
 */
hait.form.field.SelectField = function() {

	/**
	 * 是否为复选
	 */
	this.multiple = false;

	/**
	 * 显示的值
	 */
	this.displayValue = null;

	/**
	 * 模式，有三种情况：local,dict,func,url
	 */
	this.mode = "local";

	/**
	 * 下拉选项值数组，由显示和值构成
	 */
	this.options = [];

	/**
	 * mode为dect时的相关参数
	 */
	this.dict = null;

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
	this.optionText = null;
	this.auto = true; // 是否自动获取数据

	/**
	 * mode为url时的相关参数
	 */
	this.url = null;

	/**
	 * 是否使用缓存，就是每次查询的数据会自动缓存
	 */
	this.cache = false;
	
	/**
	 * 增加“全部”查询项
	 */
	this.addQueryAll = false;

	/**
	 * 放置事件对象
	 */
	this.onchange = null; // 选择变更事件
	this.onrefresh = null; // 完成刷新后执行的事件
	this.onload = null; // 下拉数据初始化完毕时间

	/**
	 * 私有属性
	 */
	this._clickButton = null;
	this._displayInput = null;
	this._isInitComplete = false; // 是否已经初始化完毕
	this._delayValue = null;// 延迟值（用于初始化未完成时的赋值操作）

};

// 继承于hait.form.Field对象
hait.form.field.SelectField.inherit(hait.form.Field);

/**
 * 这个方法是将页面中的select对象转换为hait_select对象
 */
hait.form.field.SelectField.prototype.convert = function(obj) {

	// 调用父级方法convert
	this.father(hait.form.Field, "convert", obj);

	// 初始化特殊属性
	this.multiple = this.obj.attr("multiple") ? true : false;
	this.cache = this.obj.attr("cache") ? true : false;
	this.mode = this.obj.attr("mode") ? this.obj.attr("mode") : "local";
	this.server = this.obj.attr("server") ? this.obj.attr("server") : "DEFAULT_SERVER";
	this.addQueryAll = this.obj.attr("add-query-all") ? true : false; // 是否查询全部，只要有数据，就是true
	
	

	// 初始化事件
	this.onchange = this.obj.attr("onchange") ? this.obj.attr("onchange") : null;
	this.onrefresh = this.obj.attr("onrefresh") ? this.obj.attr("onrefresh") : null;
	this.onload = this.obj.attr("onload") ? this.obj.attr("onload") : null;

	// 根据mode类型初始化其他特殊属性
	if (this.mode == "local") {
		// 那么获取其下拉数据
		if (this.obj[0].options) {
			for (var i = 0; i < this.obj[0].options.length; i++) {
				var option = this.obj[0].options[i];
				this.options.push({
					text : option.text,
					val : option.value
				});
			}
		}
	} else if (this.mode == "dict") {
		this.dict = this.obj.attr("dict");
		// 从缓存中获取对应数据
		if (!window.dict) {
			hait.initDict();
		}
		// 从数据字典中获取数据，并克隆后复制给options
		this.options = window.dict.get(this.dict).slice(0);
	} else if (this.mode == "func") {
		this.funcId = this.obj.attr("func-id") ? this.obj.attr("func-id") : null;
		this.params = this.obj.attr("params") ? hait.parseParam(this.obj.attr("params")) : {};
		this.params.funcId = this.funcId;
		this.optionValue = this.obj.attr("option-value") ? this.obj.attr("option-value") : "val";
		this.optionText = this.obj.attr("option-text") ? this.obj.attr("option-text") : "text";
		this.auto = this.obj.attr("auto") && this.obj.attr("auto") == "false" ? false : true;
	} else if (this.mode == "url") {
		this.url = this.obj.attr("url") ? this.obj.attr("url") : null;
		this.params = this.obj.attr("params") ? hait.parseParam(this.obj.attr("params")) : {};
		this.optionValue = this.obj.attr("option-value") ? this.obj.attr("option-value") : "val";
		this.optionText = this.obj.attr("option-text") ? this.obj.attr("option-text") : "text";
		this.auto = this.obj.attr("auto") && this.obj.attr("auto") == "false" ? false : true;
	}

	// 参数初始化完毕，然后交给draw方法进行绘制
	this.draw();
};

/**
 * 直接绘制对象
 * 
 * @param obj
 */
hait.form.field.SelectField.prototype.draw = function() {

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

	if (this.auto) {
		// 获取数据
		this._getData();
	}
};

/**
 * 默认的getValue操作
 */
hait.form.field.SelectField.prototype.getValue = function() {
	// 在内部操作中会随时将值写入该属性中
	return this.value;
};

hait.form.field.SelectField.prototype.getDisplayValue = function() {
	// 在内部操作中会随时将值写入该属性中
	return this._displayInput.val();
};

/**
 * 默认的setValue操作
 * 
 * @param val
 */
hait.form.field.SelectField.prototype.setValue = function(val) {
	if (!this._isInitComplete) {
		// 表示没有加载完成,将值保存起来,等待加载完成后再添加
		this._delayValue = val;
		return false;
	}
	if (!val) {
		return false;
	}

	this.value = val;
	var curText = "";

	// 根据情况设置下拉选框中的信息
	if (!this.multiple) {
		// 获取值和显示值
		for (var i = 0; i < this.options.length; i++) {
			var option = this.options[i];
			if (option.val == val) {
				curText = option.text;
				break;
			}
		}

		// 进行设置显示值
		this._displayInput.val(curText);
		// 设置选中样式
		this.obj.find(".selected").removeClass("selected");
		var searchVal = (val + "").escapeJquerySelector();
		this.obj.find("li[val=" + searchVal + "]").addClass("selected");
		return;
	}

	// 处理复选情况
	var curValue = val.split(",");

	// 计算显示的值,并设置到显示对象中
	for (var i = 0; i < curValue.length; i++) {
		for (var j = 0; j < this.options.length; j++) {
			var option = this.options[j];
			if (option.val == curValue[i]) {
				curText += option.text + ",";
				break;
			}
		}
	}
	curText = curText.deleteLastComma();

	// 进行设置显示值
	this._displayInput.val(curText);

	// 设置选中样式
	for (var i = 0; i < curValue.length; i++) {
		this.obj.find("li[val=" + curValue[i].escapeJquerySelector() + "] > input[type=checkbox]").attr("checked", true);
	}
};

hait.form.field.SelectField.prototype.setDisplayValue = function(displayValue) {
	var curValue = "";

	// 如果是单选，那么直接查询该显示值对应的值
	if (!this.multiple) {
		for (var i = 0; i < this.options.length; i++) {
			var option = this.options[i];
			if (option.text == displayValue) {
				curValue = option.val;
				break;
			}
		}
		if (curValue != null && curValue.length > 0) {
			this.setValue(curValue);
		}
		return;
	}

	var displayValueArr = displayValue.split(",");

	// 计算显示的值,并设置到显示对象中
	for (var i = 0; i < displayValueArr.length; i++) {
		var curDisplayValue = displayValueArr[i];
		for (var j = 0; j < this.options.length; j++) {
			var option = this.options[j];
			if (option.text == curDisplayValue) {
				curValue += option.val + ",";
				break;
			}
		}
	}
	curValue = curValue.deleteLastComma();
	this.setValue(curValue);
};

/**
 * 设置只读
 * 
 * @param isReadonly
 */
hait.form.field.SelectField.prototype.setReadonly = function(isReadonly) {
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
hait.form.field.SelectField.prototype.setDisabled = function(isDisabled) {
	this.father(hait.form.Field, "setDisabled", isDisabled);
	if (this.disabled) {
		this._displayInput.attr("disabled", true);
		this.obj.attr("disabled", true);
	} else {
		this._displayInput.removeAttr("disabled");
		this.obj.removeAttr("disabled");
	}
};

hait.form.field.SelectField.prototype.refresh = function() {
	// 开始初始化，设置初始化开始标志
	this._isInitComplete = false;

	// 清除当前输入框的值
	this.value = null;
	this._displayInput.val("");

	// 开始重新获取数据
	this._getData();
};

hait.form.field.SelectField.prototype.reset = function() {
	// 开始初始化，设置初始化开始标志// 开始初始化，设置初始化开始标志
	this._isInitComplete = false;

	// 清除当前输入框的值
	this.value = null;

	// 如果存在默认值，那么设置延迟值为默认值
	if (this.defaultValue) {
		this._delayValue = this.defaultValue;
	}

	if (this.auto) {
		// 开始重新获取数据
		this._getData();
	}
};

/**
 * 内部方法，根据设置获取数据的方法
 * 
 * @private
 */
hait.form.field.SelectField.prototype._getData = function() {
	var _this = this;

	// 如果使用了缓存，那么需要判断缓存中是否存在该数据
	if (this.cache) {
		// 获取缓存键
		var cacheKey = this._getCacheKey();
		// 从数据缓存中获取
		var cacheValue = hait.cache.get(cacheKey, "HAIT_CACHE_DATA");
		// 如果找到数据，那么直接显示数据
		if (cacheValue != null && cacheValue.length > 0) {
			this.options = $.parseJSON(cacheValue);
			this._fillOption();
			return;
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
	} else {
		// 其他情况,则表示数据已经准备好,直接绘制内容即可
		_this._fillOption();
	}
};

/**
 * 获得缓存键
 * 
 * @returns
 */
hait.form.field.SelectField.prototype._getCacheKey = function() {
	// 创建缓存Key
	var cacheKey = this.funcId;
	if (this.params) {
		for ( var key in this.params) {
			if (key == "funcId") {
				continue;
			}
			cacheKey += key;
			cacheKey += this.params[key];
		}
	}
	// 进行md5加密，目的是不让key太长
	cacheKey = $.md5(cacheKey);
	return cacheKey;
};

/**
 * 
 * 远程请求的回调函数
 */
hait.form.field.SelectField.prototype._analyzeRemoteResult = function(data) {
	var _this = this;

	var response = data.responses[0];

	// 如果发生了错误,弹出对话框进行提示
	if (response.flag <= 0) {
		alert(response.message);
		return;
	}

	this.options = [];
	var items = response.items;
	if (items == null || items.length < 1) {
		return;
	}
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		this.options.push({
			text : item[_this.optionText],
			val : item[_this.optionValue],
			source : item
		});
	}
};

/**
 * 内部方法,填充总体html
 * 
 * @private
 */
hait.form.field.SelectField.prototype._fillHtml = function() {
	var _this = this;
	this._displayInput = $("<input type='text' class='select-show-text'/>");

	// 获得焦点事件
	this._displayInput.focusin(function() {
		// 如果禁用了，就不用做任何处理
		if (_this.disabled || _this.readonly) {
			return false;
		}

		// 如果下拉框是隐藏状态，那么就显示
		if (_this.obj.find(".select-items").css("display") == "none") {
			_this.obj.find(".select-items").show();
		}
	});

	// 失去焦点事件
	this._displayInput.focusout(function() {
		// 如果禁用了，就不用做任何处理
		if (_this.disabled || _this.readonly) {
			return false;
		}
		window.setTimeout(function() {
			// 如果下拉框是显示状态，那么就隐藏
			if (_this.obj.find(".select-items").css("display") == "block") {
				_this.obj.find(".select-items").hide();
			}
		}, 300);
	});

	this._displayInput.keydown(function() {
		if (window.event.keyCode == "9") {
			return true;
		}
		return false;
	});

	// 设置keyup事件
	this._displayInput.keyup(function() {
		// 如果存在特殊字符处理，那么就不再向下处理
		if (_this._specialKeyCode(window.event.keyCode)) {
			return;
		}
		return false;
	});

	// 如果设置占位符,那么添加
	if (this.placeholder) {
		this._displayInput.attr("placeholder", this.placeholder);
	}

	this._displayInput.attr("readonly", "readonly");

	// 创建按钮
	var imgUrl = HOST_URL + "/frame/hait/css/images/down.png";
	this._clickButton = $("<div class='select-button'><img src='" + imgUrl + "'></div>");

	/**
	 * 点击事件
	 */
	this._clickButton.click(function() {
		if (_this.disabled || _this.readonly) {
			return false;
		}
		
		// 设置屏幕点击事件
		$(document).one("click." + _this.id, {
			selectFieldId : _this.id
		}, function(event) {
			var selectField = hait.getCompById(event.data.selectFieldId);
			if(selectField == null){
				return;
			}
			var selectItems = selectField.obj.find(".select-items");
			if(selectItems.css("display") == "block"){
				selectItems.hide();
			}
		});
		
		_this.obj.find(".select-items").toggle();
		// 停止后续的冒泡事件!
		event.stopPropagation();
	});

	// 添加这些元素
	this.obj.append(this._displayInput);
	this.obj.append(this._clickButton);
	this.obj.append("<ul class='select-items'></ul>");
	
	// 下拉框点击后，禁止再冒泡
	this.obj.find(".select-items").click(function(){
		event.stopPropagation();
	});
};

/**
 * 内部方法,填充下拉部分的html
 * 
 * @private
 */
hait.form.field.SelectField.prototype._fillOption = function() {
	var _this = this;
	
	// 获得下拉列表
	var selectItems = this.obj.find(".select-items");
	selectItems.empty();

	// 如果没有任何内容，就直接返回
	if (this.options == null || this.options.length == 0) {
		hait.log.info("下拉列表组件获取字典项目[" + this.dict + "]为空，请检查!");
		return;
	}

	if (this.cache) {
		// 如果设置了缓存，那么将这个保存起来
		var cacheKey = this._getCacheKey();
		hait.cache.set(cacheKey, "HAIT_CACHE_DATA", JSON.stringify(this.options));
	}

	// 如果需要查询全部，那么自动为options增加全部查询项，值为0
	if(this.addQueryAll) {
		var isHaveQueryAll = false;
		for (var i = 0; i < this.options.length; i++) {
			var option = this.options[i];
			// 如果存在，就不用再进行了
			if(option.text == "全部") {
				isHaveQueryAll = true;
				break;
			}
		}
		if(!isHaveQueryAll) {
			this.options.unshift({
				text : "全部",
				val : "0"
			});
		}
	}

	for (var i = 0; i < this.options.length; i++) {
		var option = this.options[i];
		var selectItem = $("<li></li>");
		// 将JSON值保存起来，供后面使用
		selectItem.data("option_data", JSON.stringify(option));
		if (this.multiple) {
			selectItem.append("<input type='checkbox'/>");
			selectItem.find("input[type=checkbox]").click(function() {
				// 保存之前的值
				var prevValue = _this.value;
				// 获取所有选中的值,显示到界面上
				var curText = "";
				var curValue = "";
				var curOption = [];
				_this.obj.find("input[type=checkbox]:checked").each(function() {
					curText += $(this).parent().attr("text") + ",";
					curValue += $(this).parent().attr("val") + ",";
					curOption.push($.parseJSON($(this).parent().data("option_data")));
				});
				// 清除最后的逗号
				curText = curText.deleteLastComma();
				curValue = curValue.deleteLastComma();
				_this._displayInput.val(curText);
				_this.value = curValue;

				// 执行onchange事件
				if (_this.onchange && prevValue != _this.value) {
					// 当配置了事件对象，并且新值不等于旧值的时候触发
					_this.trigger(_this.onchange, _this, prevValue, _this.value, curOption);
				}
				event.stopPropagation();
			});
		}
		selectItem.append(option.text);
		selectItem.attr("val", option.val);
		selectItem.attr("text", option.text);
		selectItems.append(selectItem);

		// 下拉选项的点击事件
		selectItem.click(function() {
			if (_this.multiple) {
				$(this).find("input[type=checkbox]").click();
				event.stopPropagation();
				return;
			}
			// 保存之前的值
			var prevValue = _this.value;
			_this.obj.find(".selected").removeClass("selected");
			$(this).addClass("selected");
			var curText = $(this).attr("text");
			_this._displayInput.val(curText);
			_this.value = $(this).attr("val");
			_this.obj.find(".select-items").hide();
			var curOptionDate = $(this).data("option_data"); // 获取当前选中行的值
			// 执行onchange事件
			if (_this.onchange && prevValue != _this.value) {
				// 当配置了事件对象，并且新值不等于旧值的时候触发
				_this.trigger(_this.onchange, _this, prevValue, _this.value, $.parseJSON(curOptionDate));
			}
			event.stopPropagation();
		});
	}

	// 如果延迟值为空字符串，那么视为空
	if (this._delayValue != null && this._delayValue.length == 0) {
		this._delayValue = null;
	}

	// 如果没有默认值，没有占位符，存在下拉数据，那么设置一个为默认值
	if (this.value == null && this._delayValue == null && this.placeholder == null && this.options.length > 0) {
		this._delayValue = this.options[0].val;
	}

	// 设置数据获取完毕的状态,并设置初始值
	this._isInitComplete = true;
	if (this._delayValue) {
		this.setValue(this._delayValue);
		this._delayValue = null;
	}

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
hait.form.field.SelectField.prototype._specialKeyCode = function(keyCode) {
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
		var prevValue = _this.value;
		// 对当前对象进行赋值
		_this.value = nextSelectItem.attr("val");
		_this._displayInput.val(nextSelectItem.attr("text"));
		var curOptionDate = nextSelectItem.data("option_data"); // 获取当前选中行的值

		// 执行onchange事件
		if (_this.onchange && prevValue != _this.value) {
			// 当配置了事件对象，并且新值不等于旧值的时候触发
			_this.trigger(_this.onchange, _this, prevValue, _this.value, $.parseJSON(curOptionDate));
		}
		return true;
	} else if (keyCode == "40") {
		// 向下的按钮
		var curSelectItem = selectItems.find(".selected");
		var nextSelectItem = selectItems.find("li").first();
		if (curSelectItem.size() > 0) {
			nextSelectItem = curSelectItem.next();
			curSelectItem.removeClass("selected");
		}
		nextSelectItem.addClass("selected");
		var prevValue = _this.value;
		// 对当前对象进行赋值
		_this.value = nextSelectItem.attr("val");
		_this._displayInput.val(nextSelectItem.attr("text"));
		var curOptionDate = nextSelectItem.data("option_data"); // 获取当前选中行的值

		// 执行onchange事件
		if (_this.onchange && prevValue != _this.value) {
			// 当配置了事件对象，并且新值不等于旧值的时候触发
			_this.trigger(_this.onchange, _this, prevValue, _this.value, $.parseJSON(curOptionDate));
		}
		return true;
	} else if (keyCode == "13") {
		// 回车的按钮，关闭下拉框即可
		selectItems.hide();
		return true;
	}

	return false;
};