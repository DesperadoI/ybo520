/**
 * 统一导入所有框架资源文件的地方
 */

// 生成日期，用于控制每日都是导入全新的框架
var curDate = new Date();
var FRAME_VERSION = curDate.getFullYear() + "" + (curDate.getMonth() + 1) + "" + curDate.getDate();

// 解析链接中的参数
var curUrl = window.location.search;
var urlParams = {};
if (curUrl.indexOf("?") != -1) {
	curUrl = curUrl.substring(curUrl.indexOf("?") + 1);
	curUrl = curUrl.split("&");// 使用&将之转换为数组
	for (var i = 0; i < curUrl.length; i++) {
		// 分离出其中的键值
		var key = curUrl[i].split("=")[0];
		var val = curUrl[i].split("=")[1];
		urlParams[key] = val;
	}
}

//解析显示模式，高清:1普通:2
var showType = "1"; // 默认为高清模式

//如果存在显示模式，那么使用该显示模式
if (window.localStorage.getItem("showType") != null) {
	showType = window.localStorage.getItem("showType");
}

//如果链接中存在显示样式设置，那么使用该样式，并设置样式
if (urlParams["showType"]) {
	showType = urlParams["showType"];
	window.localStorage.setItem("showType", showType);
}

//如果运行到这里，显示模式，那么显示模式设置
if (showType != null && showType.length > 0 && showType == "2") {
	document.write('<link rel="stylesheet" href="' + BASE_PATH + '/frame/hait/css/default-low.css?v=' + FRAME_VERSION + '" />');
}

// 解析主题文件
var theme = null;

// 如果存在主题缓存，那么使用该主题
if (window.localStorage.getItem("theme") != null) {
	theme = window.localStorage.getItem("theme");
}

// 如果链接中存在主题设置，那么使用该主题，并设置主题
if (urlParams["theme"]) {
	theme = urlParams["theme"];
	window.localStorage.setItem("theme", theme);
}

// 如果运行到这里，存在主题，那么进行主题设置
if (theme != null && theme.length > 0) {
	document.write('<link rel="stylesheet" href="' + BASE_PATH + '/frame/hait/css/theme/' + theme + '.css?v=' + FRAME_VERSION + '" />');
}

// 如果链接中存在token，那么使用该token
if(urlParams["token"]) {
	window.localStorage.setItem("token", urlParams["token"]);
}

/**
 * 导入hait6.0框架的核心、常用类
 */
document.write('<script src="' + BASE_PATH + '/frame/hait/hait.js?v=' + FRAME_VERSION + '"></script>');