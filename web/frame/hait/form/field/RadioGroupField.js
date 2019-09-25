/**
 * RadioGroupField对象，复选框对象
 * 
 * @author pandong
 * @date 2016-09-11 下午16:37:30
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.form.field");
hait.register("hait.form.field.SelectField");

/**
 * RadioGroupField对象构造方法
 */
hait.form.field.RadioGroupField = function() {
};

// 继承于hait.form.field.RadioGroupField对象
hait.form.field.RadioGroupField.inherit(hait.form.field.SelectField);

/**
 * 重写获取显示的值
 * @returns {String}
 */
hait.form.field.RadioGroupField.prototype.getDisplayValue = function() {
	var curValue = this.getValue();
	var curText = "";

	// 计算显示的值,并设置到显示对象中
	for (var j = 0; j < this.options.length; j++) {
		var option = this.options[j];
		if (option.val == curValue) {
			curText += option.text;
			break;
		}
	}
	return curText;
};

/**
 * 默认的setValue操作
 * 
 * @param val
 */
hait.form.field.RadioGroupField.prototype.setValue = function(val) {
	if (!this._isInitComplete) {
		// 表示没有加载完成,将值保存起来,等待加载完成后再添加
		this._delayValue = val;
		return false;
	}
	if (!val) {
		return false;
	}

	this.value = val;
	
	this.obj.find("input[type=radio]").each(function(){
		this.checked = false;
	});

	// 将对应的复选框设置为选中
	this.obj.find("input[type=radio][value=" + this.value + "]")[0].checked = true;
};

/**
 * 设置只读
 * 
 * @param isReadonly
 */
hait.form.field.RadioGroupField.prototype.setReadonly = function(isReadonly) {
	// 不做任何操作
};

/**
 * 设置禁用
 * 
 * @param isDisabled
 * @returns
 */
hait.form.field.RadioGroupField.prototype.setDisabled = function(isDisabled) {
	this.obj.find("input[type='radio']").each(function() {
		if(isDisabled){
			$(this).attr("disabled", "disabled");
		}else{
			$(this).removeAttr("disabled");
		}
	});
};

/**
 * 重写绘制对象
 * 
 * @param obj
 */
hait.form.field.RadioGroupField.prototype._fillHtml = function() {
	// 由于是复选框组，所以最外层的样式为hait-checkbox
	this.obj.removeClass("hait-select");
	this.obj.addClass("hait-checkbox");
	// 其他就不需要再做什么
};

/**
 * 重写填充选项方法
 */
hait.form.field.RadioGroupField.prototype._fillOption = function() {
	var _this = this;
	// 清除内容
	this.obj.empty();

	for (var i = 0; i < this.options.length; i++) {
		var option = this.options[i];
		var radioItem = $("<label><input type='radio'/></label>");
		
		radioItem.append(option.text);
		radioItem.find("input").attr("name", this.id);
		radioItem.find("input").attr("value", option.val);
		radioItem.find("input").attr("text", option.text);
		this.obj.append(radioItem);

		// 下拉选项的点击事件
		radioItem.click(function() {
			var prevValue = _this.value;
			// 获取现在的值
			_this.value = $(this).find("input[type=radio]").val();
			// 执行onchange事件
			if (_this.onchange && prevValue != _this.value) {
				// 当配置了事件对象，并且新值不等于旧值的时候触发
				_this.trigger(_this.onchange, _this, prevValue, _this.value);
			}
		});
	}

	// 设置数据获取完毕的状态,并设置初始值
	this._isInitComplete = true;
	if (this._delayValue) {
		this.setValue(this._delayValue);
		this._delayValue = null;
	}
};