/**
 * Map键值对对象，语法和Java类似
 * 
 * @author pandong
 * @date 2012-03-22下午11:15:47
 * @Copyright(c) yunlaila.com.cn
 */

hait.namespace("hait.util");

hait.util.Map = function() {
	this.mapArr = new Object();
	this.arrlength = 0;
};

/**
 * 添加对象到Map
 * 
 * @param key
 * @param value
 */
hait.util.Map.prototype.put = function(key, value) {
	if (!this.containsKey(key)) {
		this.mapArr[key] = value;
		this.arrlength = this.arrlength + 1;
	}
};

/**
 * 根据key从Map对象中获取数据
 * 
 * @param key
 * @returns
 */
hait.util.Map.prototype.get = function(key) {
	return this.mapArr[key];
};

/**
 * 根据key删除value
 * 
 * @param key
 */
hait.util.Map.prototype.remove = function(key) {
	delete this.mapArr[key];
	this.arrlength = this.arrlength - 1;
};

/**
 * 得到当前Map对象的长度
 * 
 * @returns {Number}
 */
hait.util.Map.prototype.size = function() {
	return this.arrlength;
};

/**
 * 判断是否包含key
 * 
 * @param key
 * @returns {Boolean}
 */
hait.util.Map.prototype.containsKey = function(key) {
	return (key in this.mapArr);
};

/**
 * 得到Map对象的键集
 * 
 * @returns {Array}
 */
hait.util.Map.prototype.keys = function() {
	var keysArr = [];
	for ( var p in this.mapArr) {
		keysArr[keysArr.length] = p;
	}
	return keysArr;
};

/**
 * 判断Map对象是否为空
 * 
 * @returns {Boolean}
 */
hait.util.Map.prototype.isEmpty = function() {
	if (this.size() == 0) {
		return false;
	}
	return true;
};

/**
 * 对Map对象进行循环
 * 
 * @param callback
 */
hait.util.Map.prototype.each = function(callback) {
	for ( var p in this.mapArr) {
		var result = callback(p, this.mapArr[p]);
		// 如果存在值，并且为false，那么就不再继续执行了
		if (result != null && result == false) {
			return false;
		}
	}
	// 如果运行到这里，就表示正常循环完了的
	return true;
};

/**
 * 判断某对象是否为Map对象
 * 
 * @param map
 * @returns {Boolean}
 */
hait.util.Map.isMap = function(map) {
	return (map instanceof hait.util.Map);
};