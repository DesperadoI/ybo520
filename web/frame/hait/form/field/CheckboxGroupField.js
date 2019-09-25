/**
 * CheckboxGroupField对象，复选框对象
 * 
 * @author pandong
 * @date 2016-09-11 下午16:37:30
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.form.field");
hait.register("hait.form.field.SelectField");

/**
 * CheckboxGroupField对象构造方法
 */
hait.form.field.CheckboxGroupField = function() {
};

// 继承于hait.form.field.CheckboxGroupField对象
hait.form.field.CheckboxGroupField.inherit(hait.form.field.SelectField);

/**
 * 重写获取显示的值
 * @returns {String}
 */
hait.form.field.CheckboxGroupField.prototype.getDisplayValue = function() {
	var curValue = this.getValue().split(",");
	var curText = "";

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
	return curText;
};

/**
 * 默认的setValue操作
 * 
 * @param val
 */
hait.form.field.CheckboxGroupField.prototype.setValue = function(val) {
	if (!this._isInitComplete) {
		// 表示没有加载完成,将值保存起来,等待加载完成后再添加
		this._delayValue = val;
		return false;
	}
	if (!val) {
		return false;
	}

	this.value = val;
	var curValue = val.split(",");
	this.obj.find("input[type=checkbox]").each(function(){
		this.checked = false;
	});
	
	// 将对应的复选框设置为选中
	for (var i = 0; i < curValue.length; i++) {
		this.obj.find("input[type=checkbox][value=" + curValue[i] + "]")[0].checked = true;
	}
};

/**
 * 设置只读
 * 
 * @param isReadonly
 */
hait.form.field.CheckboxGroupField.prototype.setReadonly = function(isReadonly) {
	// 不做任何操作
};

/**
 * 设置禁用
 * 
 * @param isDisabled
 * @returns
 */
hait.form.field.CheckboxGroupField.prototype.setDisabled = function(isDisabled) {
	this.obj.find("input[type='checkbox']").each(function() {
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
hait.form.field.CheckboxGroupField.prototype._fillHtml = function() {
	// 由于是复选框组，所以最外层的样式为hait-checkbox
	this.obj.removeClass("hait-select");
	this.obj.addClass("hait-checkbox");
	// 其他就不需要再做什么
};

/**
 * 重写填充选项方法
 */
hait.form.field.CheckboxGroupField.prototype._fillOption = function() {
	var _this = this;
	// 清除内容
	this.obj.empty();

	for (var i = 0; i < this.options.length; i++) {
		var option = this.options[i];
		var checkboxItem = $("<label><input type='checkbox'/></label>");
		
		checkboxItem.append(option.text);
		checkboxItem.find("input").attr("name", this.id);
		checkboxItem.find("input").attr("value", option.val);
		checkboxItem.find("input").attr("text", option.text);
		this.obj.append(checkboxItem);

		// 下拉选项的点击事件
		checkboxItem.click(function() {
			// 获取之前的值
			var prevValue = _this.value;
			
			// 获取当前全部选中的值
			var curValue = "";
			_this.obj.find("input[type=checkbox]").each(function(){
				if(this.checked){
					curValue += $(this).val() + ",";
				}
			});
			
			if(curValue.length > 0){
				curValue = curValue.substring(0, curValue.length - 1);
			}
			_this.value = curValue;

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