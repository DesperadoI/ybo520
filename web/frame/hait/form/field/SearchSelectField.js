/**
 * SearchSelectField对象，查询下拉菜单对象，分为单选还是复选
 * 
 * @author pandong
 * @date 2016-09-06 上午10:56:30
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.form.field");

hait.register("hait.form.field.SelectField");

/**
 * SearchSelectField对象构造方法
 */
hait.form.field.SearchSelectField = function() {
	/**
	 * 查询字段，默认为optionText
	 */
	this.search = null;

	/**
	 * 不进行查询，默认为false，用于只想可输入，但是不进行查询的情况
	 */
	this.noSearch = false;

	/**
	 * 私有属性
	 */
	this._localData = null; // 全部原始数据
	this._isPinyin = false; // 是否是输入法
};

// 继承于hait.form.SelectField对象
hait.form.field.SearchSelectField.inherit(hait.form.field.SelectField);

hait.form.field.SearchSelectField.prototype.convert = function(obj) {
	// 初始化更多属性
	this.search = $(obj).attr("search") ? $(obj).attr("search") : this.optionText;
	this.noSearch = $(obj).attr("no-search") ? true : false;

	// 调用父级方法convert
	this.father(hait.form.field.SelectField, "convert", obj);
};

/**
 * 直接绘制对象
 * 
 * @param obj
 */
hait.form.field.SearchSelectField.prototype.draw = function() {
	var _this = this;
	// 调用父级方法draw
	this.father(hait.form.field.SelectField, "draw");

	// 将原始数据保存起来
	if (_this.mode == "local" || _this.mode == "dict") {
		this._localData = this.options;
	}

	// 这种组件不能复选，因为会冲突
	this.multiple = false;

	// 让输入框可操作
	this._displayInput.removeAttr("readonly");

	// 去掉父级设置的事件，重新设计
	this._displayInput.unbind("keydown");
	this._displayInput.unbind("keyup");

	// 对拼音输入法环境下进行控制
	this._displayInput.on("compositionstart", function() {
		_this._isPinyin = true;
	});
	this._displayInput.on("compositionend", function() {
		_this._isPinyin = false;
	});

	// 设置不允许输入的内容
	this._displayInput.keydown(function() {
		// 不允许输入单引号
		if (event.keyCode == 222) {
			return false;
		}
	});

	// 设置keyup事件
	this._displayInput.keyup(function() {
		// 如果存在特殊字符处理，那么就不再向下处理
		if (_this._specialKeyCode(window.event.keyCode)) {
			return;
		}
		
		// 如果是拼音输入法环境下，那么就不向下执行了
		if(_this._isPinyin) {
			return;
		}

		// 如果设置了不查询，那么就不向下执行了
		if (_this.noSearch) {
			return;
		}
		
		// 按下删除键，就全部删除
		if (event.keyCode == 8) {
			_this.value = null;
			_this._displayInput.val("");
		}

		var search = $(this).val();
		switch (_this.mode) {
		case "local":
		case "dict":
			_this.options = [];
			for (var i = 0; i < _this._localData.length; i++) {
				var curData = _this._localData[i];
				if (curData.text.indexOf(search) == -1) {
					continue;
				}
				_this.options.push(curData);
			}
			// 重新填充数据
			_this._getData();
			break;
		case "func":
			_this.params[_this.search] = search;
			// 重新填充数据
			_this._getData();
			break;
		case "url":
			_this.params[_this.search] = search;
			// 重新填充数据
			_this._getData();
			break;
		}

		// 如果下拉框是隐藏状态，那么就显示
		var selectItems = _this.obj.find(".select-items");
		if (selectItems.css("display") == "none") {
			selectItems.show();
		}
	});
};