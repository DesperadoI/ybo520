/**
 * 基础组件
 * 
 * @author pandong
 * @date 2013-03-03 下午16:00:00
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.base");

/**
 * 所有类的父类
 */
hait.base.Component = function() {

	/**
	 * 对象编号，该编号会输出到page中
	 */
	this.id = null;

	/**
	 * 本身蕴含的Jquery对象的，比如list对象中的ul对象
	 */
	this.obj = null;

	/**
	 * 保存log对象，让所有子类和log实际对象进行解耦
	 */
	this.log = hait.log;
};

/**
 * 这个方法用于对对象的属性进行初始化，用于手动批量初始化属性时使用
 * 
 * @param params
 *            参数
 */
hait.base.Component.prototype.setParam = function(params) {
	for ( var prop in params) {
		this[prop] = params[prop];
	}
};

/**
 * 默认的convert实现，需要子类去实现，这里什么都没有
 */
hait.base.Component.prototype.convert = function(obj) {
	this.obj = $(obj);
	this.id = this.obj.attr("id") ? this.obj.attr("id") : this.getRandomId();
};

/**
 * 默认的draw实现，需要子类去实现，这里什么都没有
 */
hait.base.Component.prototype.draw = function() {
	// 如果没有编号，则随时生成一个
	if (this.id == null) {
		this.id = this.getRandomId();
	}
	
	if (window.compsById == undefined) {
        window.compsById = {};
    }
	
	if (window.compsByName == undefined) {
        window.compsByName = {};
    }

    // 如果该元素存在id，那么将对象设置到window中供后期调用
	window.compsById[this.id] = this;
	
	// 如果该元素存在name，那么将对象设置到window中供后期调用
    if (this.name) {
        window.compsByName[this.name] = this;
    }
	
	// 这里只返回空，因为具体的内容由子类来实现
	return null;
};

/**
 * 删除这个对象
 */
hait.base.Component.prototype.remove = function() {
	this.obj.remove();
};

/**
 * 用于调用父级同名方法
 * 
 * @param clazz
 * @param methodName
 * @returns
 */
hait.base.Component.prototype.father = function(clazz, methodName) {
	var object = new clazz();
	var method = object[methodName];
	return method.apply(this, Array.prototype.slice.call(arguments, 2));
};

/**
 * 获得一个随机数，用于id
 * 
 * @returns
 */
hait.base.Component.prototype.getRandomId = function() {
	return Math.round(Math.random() * 100000) + 100000;
};

/**
 * 统一的触发事件的方法，然后根据参数返回对应的内容，最多传递五个参数
 * 
 * @param method
 *            方法名
 */
hait.base.Component.prototype.trigger = function(method, value1, value2, value3, value4, value5) {
	// 检查有效性
	if (method == undefined) {
		return;
	}
	var returnValue = null;
	// 这里存在两种可能，是一个方法或者是一个字符串
	if (typeof (method) == "string") {
		// 如果字符串中存在()，直接删除
		if (method.indexOf("(") != -1) {
			method = method.substring(0, method.indexOf("("));
		}
		// 这里将该值保存起来的目的是因为在编译的过程中，变量名称会发生变化，但是this是不会发生变化的
		if (value1 == null) {
			// 如果参数1不存在，那么默认传回this
			value1 = this;
		}
		$(this).data("hait.trigger.value1", value1);
		$(this).data("hait.trigger.value2", value2);
		$(this).data("hait.trigger.value3", value3);
		$(this).data("hait.trigger.value4", value4);
		$(this).data("hait.trigger.value5", value5);
		returnValue = eval("window."
				+ method
				+ "($(this).data('hait.trigger.value1'),$(this).data('hait.trigger.value2'),$(this).data('hait.trigger.value3'),$(this).data('hait.trigger.value4'),$(this).data('hait.trigger.value5'));");
		// 使用完毕后删除这个值
		$(this).removeData("hait.trigger.value1");
		$(this).removeData("hait.trigger.value2");
		$(this).removeData("hait.trigger.value3");
		$(this).removeData("hait.trigger.value4");
		$(this).removeData("hait.trigger.value5");
	} else {
		returnValue = method(value1 ? value1 : this, value2, value3, value4, value5);
	}
	return returnValue;
};