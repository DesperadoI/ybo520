/**
 * TreeField对象，树形下拉对象，分为单选还是复选
 * 
 * @author pandong
 * @date 2013-03-03 下午19:37:30
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.form.field");

hait.register("hait.form.Field");
hait.register("hait.tree.Tree");

/**
 * SelectField对象构造方法
 */
hait.form.field.TreeField = function() {

	/**
	 * 是否为复选
	 */
	this.multiple = false;

	/**
	 * 值列名称
	 */
	this.returnValue = "value";

	/**
	 * 模式：local,func
	 */
	this.mode = "local";

	/**
	 * func模式时的参数对象
	 */
	this.funcId = null;
	this.params = {};

	/**
	 * 树形数据
	 */
	this.data = null;

	/**
	 * 是否使用缓存，就是每次查询的数据会自动缓存
	 */
	this.cache = false;

	/**
	 * 事件
	 */
	this.onchange = null; // 选择变更事件
	this.onrefresh = null;// 完成刷新后执行的事件

	/**
	 * 私有属性
	 */
	this._value = null;
	this._displayInput = null;
	this._tree = new hait.tree.Tree();// 树形组件
	this._isInitComplete = false; // 是否已经初始化完毕
	this._delayValue = null;// 延迟值（用于初始化未完成时的赋值操作）
};

// 继承于hait.form.Field对象
hait.form.field.TreeField.inherit(hait.form.Field);

/**
 * 实现getValue操作
 */
hait.form.field.TreeField.prototype.getValue = function() {
	return this._value;
};
hait.form.field.TreeField.prototype.getDisplayValue = function() {
	return this._displayInput.val();
};

/**
 * 实现setValue操作
 * 
 * @param val
 */
hait.form.field.TreeField.prototype.setValue = function(val) {
	if (!this._isInitComplete) {
		// 表示没有加载完成,将值保存起来,等待加载完成后再添加
		this._delayValue = val;
		return;
	}

	var values = "";
	var texts = "";
	// 取消当前所有被选中的选中状态
	if (this.multiple) {
		this._tree.getTree().checkAllNodes(false);
	} else {
		this._tree.getTree().cancelSelectedNode();
	}
	if (val && val.length > 0) {
		// 这里的val值可能存在两种情况
		var vals = val.split(",");
		for (var i = 0; i < vals.length; i++) {
			var node = this._tree.getTree().getNodeByParam(this.returnValue, vals[i], null);
			// 如果没有找到就进行下一次
			if (node == null) {
				continue;
			}
			// 设置选中
			if (this.multiple) {
				// 设置checkbox的选中，但是下级并不联动
				this._tree.getTree().checkNode(node, true, false);
			} else {
				this._tree.getTree().selectNode(node);
			}
			values += node[this.returnValue] + ",";
			texts += (node[this.text] ? node[this.text] : node["name"]) + ",";
		}

		// 去除最后的逗号
		if (values.length > 0) {
			values = values.substring(0, values.length - 1);
			texts = texts.substring(0, texts.length - 1);
		}
	}

	this._value = values;
	this._displayInput.val(texts);

};

hait.form.field.TreeField.prototype.convert = function(obj) {

	// 初始化基本属性
	this.father(hait.form.Field, "convert", obj);

	// 初始化自身的特殊属性
	this.mode = this.obj.attr("mode") ? this.obj.attr("mode") : "local";
	this.multiple = this.obj.attr("multiple") ? true : false;
	this.returnValue = this.obj.attr("return-value") ? this.obj.attr("return-value") : "value";
	this.cache = this.obj.attr("cache") ? true : false;

	// 初始化事件
	this.onchange = this.obj.attr("onchange") ? this.obj.attr("onchange") : null;
	this.onrefresh = this.obj.attr("onrefresh") ? this.obj.attr("onrefresh") : null;

	// 初始化树形的基础树形
	this._tree.father(hait.base.Component, "convert", obj);
	this._tree._initTreeAttr(obj);

	// 将参数缓存过来
	switch (this.mode) {
	case "func":
		this.funcId = this._tree.funcId;
		this.params = this._tree.params;
		break;
	}

	// 转到draw绘制剩余的内容
	this.draw();
};

/**
 * 直接绘制对象
 * 
 * @param obj
 */
hait.form.field.TreeField.prototype.draw = function() {

	// 调用父级方法draw
	this.father(hait.form.Field, "draw");

	var _this = this;

	// 开始拼装新的对象
	var container = $("<div id='select_tree_" + this.id + "' class='hait-select'></div>");

	// 根据初始化参数进行设置
	if (this.style) {
		container.attr("style", this.style);
	}

	// 将该对象定位到指定位置
	if (this.obj) {
		// 将这个封装好的对象放置到目标对象前面
		this.obj.before(container);
		this.obj.remove();
	} else {
		// 将本地设置的tree需要的参数，设置给树形
		this._tree.mode = this.mode;
		this._tree.server = this.server;
		this._tree.multiple = this.multiple;
		this._tree.cache = this.cache;
		this._tree.attrs = this.attrs;
		switch (this._tree.mode) {
		case "local":
			this._tree.data = this.data;
			break;
		case "func":
			this._tree.funcId = this.funcId;
			this._tree.params = this.params;
			this._tree.auto = this.auto;
			this._tree.parentId = this.parentId;
			this._tree.isLeaf = this.isLeaf;
			this._tree.text = this.text;
			this._tree.idName = this.idName;
			break;
		}
	}

	this.obj = container;

	// 初始化显示input
	this._displayInput = $('<input type="text" class="select-show-text" id="select_tree_' + this.id + '_display" readonly/>');

	this.obj.append(this._displayInput);

	if (this.defaultValue) {
		this._value = this.defaultValue;
	}

	// 默认必须值
	if (this.placeholder == null || this.placeholder.length == 0) {
		this.placeholder = "请选择...";
	}

	this._displayInput.attr("placeholder", this.placeholder);

	// 初始化下拉选项按钮
	var selectBtn = $('<div class="select-button"><div class="icon icon-black-tree"></div></div>');
	selectBtn.click(function() {
		if (_this.disabled || _this.readonly) {
			return false;
		}
		
		// 设置屏幕点击事件
		$(document).one("click." + _this.id, {
			fieldId : _this.id
		}, function(event) {
			var field = hait.getCompById(event.data.fieldId);
			if(field == null){
				return;
			}
			var fieldItems = field.obj.find(".select-other-items");
			if(fieldItems.css("display") == "block"){
				fieldItems.hide();
			}
		});
		
		// 显示和隐藏下拉框
		_this.obj.find(".select-other-items").toggle();
		event.stopPropagation();
	});
	this.obj.append(selectBtn);

	var selectOptions = $("<div class='select-other-items'><ul class='ztree'></ul></div>");
	selectOptions.click(function(){
		// 运行到这里，事件就结束了，不能再继续冒泡，否则会出现重复点击
		event.stopPropagation();
	});
	this.obj.append(selectOptions);

	// 设置禁用和只读
	if (this.readonly) {
		this.setReadonly(this.readonly);
	}

	if (this.disabled) {
		this.setDisabled(this.disabled);
	}

	// 初始化树形组件事件
	this._initTreeEvent(this._tree);

	// 重新定向tree的dom对象
	this.obj.find(".ztree").attr("id", "select_tree_" + this.id + "_tree");
	// 调用树组件对象创建树
	this._tree.obj = this.obj.find(".ztree");
	
	// 初始化树形组件的编号，否则会存在编号重复
	this._tree.id = this.id + "_tree";
	// 一切就绪后，进行树形初始化
	this._tree.draw();
};

/**
 * 刷新组件
 */
hait.form.field.TreeField.prototype.refresh = function() {
	// 开始初始化，设置初始化开始标志
	this._isInitComplete = false;

	// 将当前的参数设置给tree对象，然后刷新tree
	this._displayInput.val('');
	this._value = '';

	// 将组件的功能号和参数都传递过去
	this._tree.multiple = this.multiple;
	this._tree.funcId = this.funcId;
	this._tree.params = this.params;
	this._tree.refresh();
};

/**
 * 设置禁用
 * 
 * @param val
 * @returns
 */
hait.form.field.TreeField.prototype.setDisabled = function(val) {
	this.father(hait.form.Field, "setDisabled", val);
	if (this.disabled) {
		this._displayInput.attr("disabled", "true");
		this.obj.attr("disabled", true);
	} else {
		this._displayInput.removeAttr("disabled");
		this.obj.removeAttr("disabled");
	}
};

/**
 * 设置只读
 * 
 * @param val
 */
hait.form.field.TreeField.prototype.setReadonly = function(val) {
	this.father(hait.form.Field, "setReadonly", val);
	if (this.readonly) {
		this._displayInput.attr("disabled", "true");
	} else {
		this._displayInput.removeAttr("disabled");
	}
};

/**
 * 初始化树形组件的事件
 */
hait.form.field.TreeField.prototype._initTreeEvent = function(tree) {
	var _this = this;
	// 设置树形的点击事件
	tree.onclick = function(event, treeId, treeNode) {
		// 仅单选时有效
		if (_this._tree.multiple) {
			return;
		}

		// 保存之前的值
		var prevValue = _this.getValue();

		// 获得当前行的值
		var nodes = _this._tree.getTree().getSelectedNodes();

		_this.setValue(nodes[0][_this.returnValue]);
		// 点击后，隐藏下拉界面
		_this.obj.find(".select-other-items").hide();

		// 执行onchange事件
		if (_this.onchange && prevValue != _this.getValue()) {
			// 当配置了事件对象，并且新值不等于旧值的时候触发
			_this.trigger(_this.onchange, _this, prevValue, _this.getValue(), nodes[0]);
		}
	};

	// 设置树形的复选点击事件
	tree.oncheck = function(event, treeId, treeNode) {
		// 仅复选时候有效
		if (!_this._tree.multiple) {
			return;
		}

		// 保存之前的值
		var prevValue = _this.getValue();

		// 获得当前的值
		var nodes = _this._tree.getTree().getCheckedNodes(true);
		var values = "";

		for (var i = 0; i < nodes.length; i++) {
			values += nodes[i][_this.returnValue] + ",";
		}

		if (values.length > 0) {
			values = values.substring(0, values.length - 1);
		}

		_this.setValue(values);

		// 执行onchange事件
		if (_this.onchange && prevValue != _this.getValue()) {
			// 当配置了事件对象，并且新值不等于旧值的时候触发
			_this.trigger(_this.onchange, _this, prevValue, _this.getValue(), nodes);
		}
	};

	// 树形组件刷新后，重置当前组件
	tree.onrefresh = function() {
		// 设置数据获取完毕的状态,并设置初始值
		_this._isInitComplete = true;

		// 如果有延迟值，优先使用
		if (_this._delayValue) {
			_this.setValue(_this._delayValue);
			_this._delayValue = null;
		} else if (_this.defaultValue) {
			// 如果有默认值，使用默认
			_this.setValue(_this.defaultValue);
		}
		if (_this.onrefresh) {
			_this.trigger(_this.onrefresh);
		}
	};
};