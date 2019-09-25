/**
 * Tab组件
 * 
 * @author pandong
 * @date 2012-09-17 下午22:04:47
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.layout");
hait.register("hait.util.Map");

hait.layout.TabLayout = function() {

	/**
	 * 保存所有选项卡配置数据
	 */
	this.options = [];

	/**
	 * 当前样式
	 */
	this.style = null;

	/**
	 * Tab的切换事件
	 */
	this.onchange = null;

	/**
	 * 私有属性
	 */
	this._items = new hait.util.Map(); // 所有选项卡对象
	this._itemHeight = -1; // 选项卡高度
	this._oldItem = null; // 上一个选中对象
	this._curItem = null; // 当前选中对象
};

// 继承于hait.base.Component对象
hait.layout.TabLayout.inherit(hait.base.Component);

/**
 * 自动转换
 * 
 * @param obj
 */
hait.layout.TabLayout.prototype.convert = function(obj) {
	this.father(hait.base.Component, "convert", obj);
	this.style = this.obj.attr("style") ? this.obj.attr("style") : null;
	this.onchange = this.obj.attr("onchange") ? this.obj.attr("onchange") : null;

	// 解析配置中的内容，他们应该是一一对应的关系
	var buttons = this.obj.find("div:eq(0)").children();
	var pages = this.obj.find("div:eq(1)").children();
	for (var i = 0; i < buttons.size(); i++) {
		var button = $(buttons[i]);
		var page = $(pages[i]);
		var option = new Object();
		option.text = button.text();
		// 根据情况生成类型
		option.type = "page";
		option.page = page;
		option.close = button.attr("close") ? true : false;
		this.options.push(option);
	}

	// 开始绘制
	this.draw();
};

/**
 * 绘制组件
 */
hait.layout.TabLayout.prototype.draw = function() {

	// 调用父级的同名方法
	this.father(hait.base.Component, "draw");

	// 创建Tab组件
	var container = $('<div class="hait-tab"><div class="hait-tab-title"></div><div class="hait-tab-body">&nbsp;</div></div>');

	// 如果obj不为空，那么将container对象定位放好，然后删除自己
	if (this.obj != null) {
		// 将该对象添加到页面中
		this.obj.after(container);
		// 删除这个对象
		this.obj.remove();
	}

	// 将container作为顶级对象存在
	this.obj = container;

	// 为这个组件添加树形
	this.obj.attr("id", "tab_" + this.id);

	// 回写样式
	if (this.style) {
		this.obj.attr("style", this.style);
	}

	// 初始化选项卡高度
	this._itemHeight = this.obj.height();

	// 循环添加已经配置的内容
	for (var i = 0; i < this.options.length; i++) {
		this.addTab(this.options[i]);
	}

	// 选中第一个，并忽略onchange事件
	if (this.options.length > 0) {
		this.selected(0, true);
	}
};

/**
 * 添加Tab
 */
hait.layout.TabLayout.prototype.addTab = function(options) {
	var _this = this;
	// 首先判断是否重复
	if (this._items.containsKey(options.text)) {
		// 如果有,选中即可
		var item = this._items.get(options.text);
		_this.selected(item.button.index(), false);
		return;
	}

	// 创建tab所需要的元素
	var pageId = "page_" + (this._items.size() + 1);
	var tabButton = $('<div page_id="' + pageId + '">' + options.text + '</div>');

	// 如果需要增加关闭按钮
	if (options.close) {
		var closeButton = $('<div class="icon icon-gray-close"></div>');
		closeButton.attr("page_key", options.text);
		closeButton.click(function() {
			_this.closeTab($(this).attr("page_key"));
		});
		tabButton.append(closeButton);
	}

	tabButton.addClass("tab");
	// 根据情况为tabButton添加关闭按钮
	if (options.close) {
		// 暂无任何操作
	}

	// 根据情况设置类型
	if (options.url) {
		options.type = "iframe";
	}
	if (options.page) {
		options.type = "page";
	}

	var tabPage = null;
	switch (options.type) {
	case "iframe":
		// 如果传入是url，那么就需要生成iframe
		tabPage = $('<iframe frameborder="0" src="' + options.url + '"></iframe>');
		break;
	case "page":
		// 如果page存在，那么传入的直接就是页面对象，直接使用
		tabPage = options.page;
		break;
	}
	tabPage.attr("page_id", pageId);
	tabPage.attr("class", "tab-body");
	tabPage.css("width", "100%");

	if (this._itemHeight > 46) {
		tabPage.css("height", (this._itemHeight - 46) + "px");
	}

	// 将这个信息保存起来，供其他方法操作
	this._items.put(options.text, {
		button : tabButton,
		page : tabPage
	});

	// 去掉当前的选中元素
	this.obj.find(".selected").removeClass("selected");

	// 隐藏当前所有iframe
	this.obj.find(".tab-body").hide();
	// 添加这个新的tab
	this.obj.find(".hait-tab-title").append(tabButton);
	this.obj.find(".hait-tab-body").append(tabPage);

	// 保存选中项目
	this._oldItem = tabButton;

	// 为选项卡按钮配置点击事件
	tabButton.click(function() {
		// 展示自己
		_this.selected($(this).index(), false);
	});

	// 选中当前，忽略onchange事件
	this.selected(tabButton.index(), true);
};

/**
 * 根据下标获得对应的Tab对象，可能是iframe，可能是其他
 * 
 * @param index
 */
hait.layout.TabLayout.prototype.getTab = function(index) {
	var childrens = this.obj.find(".hait-tab-body").children();
	return childrens.get(index);
};

/**
 * 选中项目
 * 
 * @param index
 * @param isIgnoreOnChange
 *            是否忽略onchange事件
 */
hait.layout.TabLayout.prototype.selected = function(index, isIgnoreOnChange) {

	// 如果没有数据，执行该方法无效
	if (this._items.size() == 0) {
		return;
	}

	if (isIgnoreOnChange == null) {
		isIgnoreOnChange = false;
	}

	// 获取当前选中对象
	this._curItem = this.obj.find(".hait-tab-title > div:eq(" + index + ")");

	// 如果设置了不忽略事件，并且配置了onchange事件，老选中项不为空，并且和新选中项目不一样
	if (!isIgnoreOnChange && this.onchange && this._oldItem.text() != this._curItem.text()) {
		// 执行该方法，并传递上一次的Tab按钮对象和本次Tab按钮对象
		var result = this.trigger(this.onchange, this._oldItem, this._curItem);
		// 如果返回值为false,那么不能再继续向下执行了
		if (result != null && result == false) {
			return;
		}
	}

	// 展示这个对象
	var pageId = this._curItem.attr("page_id");
	this.obj.find(".selected").removeClass("selected");
	this._curItem.addClass("selected");
	this.obj.find(".tab-body").hide(); // 隐藏全部的body
	this.obj.find(".hait-tab-body > *[page_id=" + pageId + "]").show();

	// 将当前对象设置为老对象
	this._oldItem = this._curItem;
};

/**
 * 根据名称关闭对应的Tab栏
 */
hait.layout.TabLayout.prototype.closeTab = function(itemKey) {
	// 读取当前对象
	var item = this._items.get(itemKey);

	// 选中前一个，并忽略事件
	this.selected(item.button.prev().index(), true);

	// 删除自己
	item.button.remove();
	item.page.remove();
	// 在items中删除自己
	this._items.remove(itemKey);
};