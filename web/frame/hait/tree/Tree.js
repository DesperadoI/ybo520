/**
 * 树形组件，采用封装ztree完成
 * 
 * @author pandong
 * @date 2013-03-04 下午21:45:01
 * @Copyright(c) htsoft.com
 */

hait.namespace("hait.tree");

hait.resource(BASE_PATH + "/frame/plugins/ztree/jquery.ztree.core-3.5.min.js");
hait.resource(BASE_PATH + "/frame/plugins/ztree/jquery.ztree.excheck-3.5.min.js");
hait.resource(BASE_PATH + "/frame/plugins/jquery/jquery.md5.js");
hait.addHead(BASE_PATH + "/frame/plugins/ztree/css/zTreeStyle.css");

/**
 * 表单对象的构造方法
 */
hait.tree.Tree = function() {
	/**
	 * 是否为复选
	 */
	this.multiple = false;

	/**
	 * 数据获取模式：local,func
	 */
	this.mode = "local";

	/**
	 * 原始数据
	 */
	this.data = null;

	/**
	 * 当mode为local时，约定获取的属性
	 */
	this.attrs = [ "text", "value", "url", "target", "click", "icon", "path" ];

	/**
	 * 目标服务器
	 */
	this.server = "DEFAULT_SERVER";

	/**
	 * mode为func时所需要的参数
	 */
	this.funcId = ""; // 功能号
	this.params = null; // 请求参数
	this.auto = true; // 初始化后自动获取数据
	this.parentId = "parent_id"; // 父列名称
	this.isLeaf = "is_leaf"; // 是否枝叶名称
	this.text = "text"; // 显示列名称
	this.idName = "id"; // 列编号名称

	/**
	 * 是否使用缓存，就是每次查询的数据会自动缓存
	 */
	this.cache = false;

	/**
	 * 事件
	 */
	this.onclick = null;// 节点点击事件
	this.oncheck = null;// 复选框点击事件
	this.onrefresh = null;// 完成刷新后执行的事件
	this.onload = null;// 完成载入后执行的事件

	/**
	 * 私有属性
	 */
	this._setting = null;// 树形的配置
	this._tree = null;// 内部树形对象
	this._isLoad = false; // 初始化完成标志
};

// 继承于hait.base.Component对象
hait.tree.Tree.inherit(hait.base.Component);

/**
 * 使用convert方式初始化树形组件
 * 
 * @param obj
 */
hait.tree.Tree.prototype.convert = function(obj) {
	// 初始化基本参数
	this.father(hait.base.Component, "convert", obj);
	
	// 初始化树形需要的格外参数
	this._initTreeAttr(obj);
	
	// 删除本身的事件，避免出现问题
	this.obj.removeAttr("onclick");

	// 初始化参数完毕，直接转到绘制方法进行绘制
	this.draw();
};

/**
 * 使用draw方式绘制树形组件
 */
hait.tree.Tree.prototype.draw = function() {

	// 调用父级的同名方法
	this.father(hait.base.Component, "draw");

	var _this = this;

	// 如果当前标签不是ul，那么会影响后面的初始化，那么直接删除即可
	if (this.obj && this.obj[0].tagName.toLowerCase() != "ul") {
		var ul = $("<ul id='tree_" + this.id + "'></ul>");
		this.obj.before(ul);
		this.obj.remove();
		this.obj = ul;
	}

	// 如果obj为空，那么使用id进行初始化
	if (this.obj == null) {
		this.obj = $("<ul id='tree_" + this.id + "'></ul>");
	}

	// 强制加上默认样式
	this.obj.attr("class", "ztree");

	// 初始化内部的setting
	this._setting = {
		check : {},
		callback : {}
	};

	// 初始化特殊参数
	if (this.multiple) {
		this._setting.check.enable = true;
	}

	// 如果配置了点击事件，那么进行配置
	if (typeof (this.onclick) == "string") {
		this._setting.callback.onClick = function(event, treeId, treeNode) {
			_this.trigger(_this.onclick, _this.obj, treeId, treeNode);
		};
	} else if (this.onclick != null) {
		this._setting.callback.onClick = this.onclick;
	}

	// 如果配置了复选框点击事件，那么进行配置
	if (typeof (this.oncheck) == "string") {
		this._setting.callback.onCheck = function(event, treeId, treeNode) {
			_this.trigger(_this.oncheck, _this.obj, treeId, treeNode);
		};
	} else if (this.oncheck != null) {
		this._setting.callback.onCheck = this.oncheck;
	}

	if (this.mode == "local") {
		// 如果是本地数据，那么直接输出即可
		this._tree = $.fn.zTree.init(this.obj, this._setting, this.data);
		
		// 如果配置了onload事件，那么执行
		if (!_this._isLoad &&  _this.onload) {
			_this._isLoad = true;
			_this.trigger(_this.onload, _this);
		}
		
		// 如果配置了onrefresh事件，那么执行
		if (_this.onrefresh) {
			_this.trigger(_this.onrefresh);
		}
	} else if (this.mode == "func" && this.auto) {
		// 从数据库获取数据然后再生成
		this._loadTreeData();
	}
};

/**
 * 刷新树形
 */
hait.tree.Tree.prototype.refresh = function() {
	// 重置当前对象
	if (this._tree) {
		this._tree.destroy();
	}
	this.obj.empty();
	this.auto = true;
	this.draw();
};

/**
 * 返回内部tree对象
 * 
 * @returns
 */
hait.tree.Tree.prototype.getTree = function() {
	return this._tree;
};

/**
 * 从远程获取Tree数据并绘制界面
 */
hait.tree.Tree.prototype._loadTreeData = function() {
	var _this = this;

	// 远程来的数据，肯定是列表形式的，那么使用该形式
	this._setting.data = {
		simpleData : {
			enable : true,
			idKey : _this.idName,
			pIdKey : _this.parentId
		},
		key : {
			name : _this.text
		}
	};

	// 封装需要传递给远程的参数
	if (this.params == null) {
		this.params == new Object();
	}
	this.params.funcId = this.funcId;

	// 如果使用了缓存，那么需要判断缓存中是否存在该数据
	if (this.cache) {
		// 获取缓存键
		var cacheKey = this._getCacheKey();
		// 从数据缓存中获取
		var cacheValue = hait.cache.get(cacheKey, "HAIT_CACHE_DATA");
		// 如果找到数据，那么直接显示数据
		if (cacheValue != null && cacheValue.length > 0) {
			_this.data = $.parseJSON(cacheValue);
			_this._createTree();
			return;
		}
	}

	// 从远程获取语句
	request({
		server : _this.server,
		data : [ _this.params ],
		func : function(data) {
			var response = data.responses[0];
			// 解析出其中的数据
			var flag = response.flag;
			var items = response.items;
			
			// 如果返回数据为空，就可以直接返回了
			if (items == null || items.length < 1) {
				_this.data = [];
				_this._createTree();
				return;
			}
			var data = new Array();
			for (var i = 0; i < items.length; i++) {
				// 根据页面配置XML读取需要的信息
				var item = items[i];
				// 根据配置的列信息进行读取
				var curDate = {};
				for ( var fieldName in item) {
					var fieldValue = item[fieldName];
					curDate[fieldName] = fieldValue;

					// 处理树形特殊操作
					if (fieldName == "checked" && fieldValue != null && fieldValue.length > 0) {
						curDate["checked"] = true;
					}
					if (fieldName == "chkDisabled" && (fieldValue == null || fieldValue.length == 0)) {
						curDate["chkDisabled"] = true;
					}
				}
				data.push(curDate);
			}
			if (flag > 0) {
				// 如果设置了缓存，那么将这个保存起来
				if (_this.cache) {
					var cacheKey = _this._getCacheKey();
					hait.cache.set(cacheKey, "HAIT_CACHE_DATA", JSON.stringify(data));
				}
			}
			_this.data = data;
			_this._createTree();
		}
	});
};

hait.tree.Tree.prototype._createTree = function() {
	var _this = this;
	
	_this._tree = $.fn.zTree.init(_this.obj, _this._setting, _this.data);

	// 如果配置了onload事件，那么执行
	if (!_this._isLoad &&  _this.onload) {
		_this._isLoad = true;
		_this.trigger(_this.onload, _this);
	}
	
	// 如果配置了onrefresh事件，那么执行
	if (_this.onrefresh) {
		_this.trigger(_this.onrefresh);
	}
};

/**
 * 获得缓存键
 * 
 * @returns
 */
hait.tree.Tree.prototype._getCacheKey = function() {
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
 * 转换DOM为Tree需要的信息
 */
hait.tree.Tree.prototype._parseDomToTreeData = function(father, items) {
	var _this = this;
	// 循环所有子元素，如果还存在元素，那么递归
	items.each(function() {
		// 获取必要数据，后面逐步增加
		var treeNode = new Object();
		treeNode.name = $(this).attr("text");

		// 初始化可用参数
		for (var j = 0; j < _this.attrs.length; j++) {
			if ($(this).attr(_this.attrs[j])) {
				treeNode[_this.attrs[j]] = $(this).attr(_this.attrs[j]);
			}
		}

		// 如果存在子元素，那么为父对象或者配置了不为枝叶，那么为对象
		if ($(this).children().size() > 0 || $(this).attr(_this.isLeaf) == "true") {
			treeNode.isParent = true;
			treeNode.children = [];
		}

		// 是否展开
		if ($(this).attr("is_open") == "true") {
			treeNode.open = true;
		}

		// 如果存在子类，那么继续递归计算
		if ($(this).children().size() > 0) {
			_this._parseDomToTreeData(treeNode.children, $(this).children());
		}

		// 如果没有子类了，那么直接保存进去
		father.push(treeNode);
	});
};

/**
 * 初始化树形属性
 * @param obj
 */
hait.tree.Tree.prototype._initTreeAttr = function(obj) {
	// 进行参数初始化，封装成方法的目的是，为了树形表单元素也能够使用
	this.mode = this.obj.attr("mode") ? this.obj.attr("mode") : "local";
	this.server = this.obj.attr("server") ? this.obj.attr("server") : "DEFAULT_SERVER";
	this.multiple = this.obj.attr("multiple") && this.obj.attr("multiple") != "false" ? true : false;
	this.cache = this.obj.attr("cache") ? true : false;
	// 如果存在attrs属性，那么将里面的配置追加到固定属性中
	if (this.obj.attr("attrs")) {
		var attrs = this.obj.attr("attrs").split(",");
		for (var i = 0; i < attrs.length; i++) {
			this.attrs.push(attrs[i]);
		}
	}

	// 初始化数据，本地数据必须是树形格式的
	if (this.mode == "local") {
		// 根据情况获取数据对象，这里存在两种情况，1：在本身内部，2：在目标内部
		var treeDataDom = this.obj.attr("data") ? $("#" + this.obj.attr("data")) : this.obj;
		this.data = [];
		this._parseDomToTreeData(this.data, treeDataDom.children());
		// 获取树形数据后，删除原数据
		this.obj.empty();
	} else {
		// 初始化远程获取数据的必要参数
		this.funcId = this.obj.attr("func-id") ? this.obj.attr("func-id") : null; // 功能号
		this.params = this.obj.attr("params") ? hait.parseParam(this.obj.attr("params")) : new Object(); // 请求参数
		this.auto = this.obj.attr("auto") && this.obj.attr("auto") == "false" ? false : true; // 初始化后自动获取数据
		this.parentId = this.obj.attr("parent-id") ? this.obj.attr("parent-id") : "parent_id"; // 父列名称
		this.isLeaf = this.obj.attr("is-leaf") ? this.obj.attr("is-leaf") : "is_leaf"; // 是否枝叶名称
		this.text = this.obj.attr("text") ? this.obj.attr("text") : "text"; // 显示列名称
		this.idName = this.obj.attr("id-name") ? this.obj.attr("id-name") : "id"; // 显示编号列名称
	}

	// 获取事件
	this.onclick = this.obj.attr("onclick") ? this.obj.attr("onclick") : this.onclick;
	this.oncheck = this.obj.attr("oncheck") ? this.obj.attr("oncheck") : this.oncheck;
	this.onrefresh = this.obj.attr("onrefresh") ? this.obj.attr("onrefresh") : this.onrefresh;
	this.onload = this.obj.attr("onload") ? this.obj.attr("onload") : this.onload;
};