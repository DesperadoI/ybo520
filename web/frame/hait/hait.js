/**
 * hait6.0框架核心类，这里放置框架的所有核心方法
 *
 * @author pandong
 * @date 2016-05-26 下午16:34:47
 * @Copyright(c) yunlaila.com.cn
 */

var hait = {
    version: '6.0',
    description: 'Hait Web Framework'
};

/**
 * 统一的提交请求的方法
 */
function request(ajaxParam) {
    // 获得token
    var token = hait.getToken();
    var type = window.localStorage.getItem("type");

    // 保证参数有效
    ajaxParam.data = ajaxParam.data ? ajaxParam.data : [];
    ajaxParam.global = ajaxParam.global ? ajaxParam.global : {};
    // 封装请求参数
    var requestXml = '<?xml version="1.0" encoding="UTF-8"?>';
    requestXml += "<requests>";
    requestXml += "<global>";
    requestXml += "<token>" + token + "</token><source>WeChat</source><type>" + type + "</type>";
    if (ajaxParam.global) {
        for (var param in ajaxParam.global) {
            requestXml += "<" + param + ">" + ajaxParam.global[param] + "</" + param + ">";
        }
    }
    requestXml += "</global>";
    for (var i = 0; i < ajaxParam.data.length; i++) {
        requestXml += "<request>";
        for (var curParam in ajaxParam.data[i]) {
            requestXml += "<" + curParam + "><![CDATA[" + ajaxParam.data[i][curParam] + "]]></" + curParam + ">";
        }
        requestXml += "</request>";
    }
    requestXml += "</requests>";

    // 默认存在提示框
    // ajaxParam.loading = ajaxParam.loading != null ? ajaxParam.loading : true;
    ajaxParam.loading = false;

    // 根据参数调整服务器地址
    if (ajaxParam.server) {
        ajaxParam.url = window[ajaxParam.server] ? window[ajaxParam.server] : DEFAULT_SERVER;
    }

    // 增加测试输出
    for (var j = 0; j < ajaxParam.data.length; j++) {
        // 如果存在这个特殊接口,那么整个数据,返回测试结果
        if (ajaxParam.data[j].funcId == "hex_frame_func_test") {
            ajaxParam.url = BASE_PATH + "/frame/doc/data/tablefunc.json";
            break;
        }

        // 如果存在这个特殊接口,那么整个数据,返回测试结果
        if (ajaxParam.data[j].funcId == "hex_frame_tablegroup_test") {
            ajaxParam.url = BASE_PATH + "/frame/doc/data/tablegroupfunc.json";
            break;
        }

        // 如果存在这个特殊接口,那么整个数据,返回测试结果
        if (ajaxParam.data[j].funcId == "hex_frame_tree_test") {
            ajaxParam.url = BASE_PATH + "/frame/doc/data/treefunc.json";
            break;
        }
    }

    // 创建访问链接，默认增加时间戳，确保每次访问都不一样
    var requestUrl = ajaxParam.url ? ajaxParam.url : DEFAULT_SERVER;
    requestUrl += requestUrl.indexOf("?") >= 0 ? "&" : "?";
    requestUrl += "r=" + new Date().getTime();

    var p = {
        url: requestUrl,
        async: ajaxParam.async == undefined ? true : ajaxParam.async,
        type: ajaxParam.type ? ajaxParam.type : 'POST',
        data: requestXml,
        dataType: ajaxParam.dataType ? ajaxParam.dataType : "json",
        processData: false,
        cache: false,
        error: function (jqXHR, textStatus, errorThrown) {
            hait.log.error(errorThrown);
        },
        dataFilter: function (data) {
            try {
                hait.log.info('服务器返回信息: [' + typeof data + ']:\n' + data);
            } catch (ex) {
                hait.log.info('服务器返回信息: [' + typeof data + ']');
            }
            return data;
        },
        success: function (data, textStatus, jqXHR) {
            // token失效
            if (data.backUrl) {
                console.log("登录失效跳转地址：" + data.backUrl);
                window.location.href = data.backUrl;
                return;
            }
            // 直接调用回调函数
            if (ajaxParam.func)
                ajaxParam.func(data);
        },
        complete: function (jqXHR, textStatus) {
            // 请求结束后的操作
            if (ajaxParam.loading) {
                hait.loader.hide();
            }
        }
    };

    if (ajaxParam.loading) {
        // 初始化Loader对话框
        if (hait.loader == null) {
            hait.register("hait.dialog.LoaderDialog");
            hait.loader = new hait.dialog.LoaderDialog();
        }
        hait.loader.show();
    }

    $.ajax(p);
};

/**
 * 创建命名空间
 */
hait.namespace = function (fullNS) {
    // 将命名空间切成N部分, 比如Kmf、Soft、Ext等
    var nsArray = fullNS.split('.');
    var sEval = "";
    var sNS = "";
    for (var i = 0; i < nsArray.length; i++) {
        if (i != 0) {
            sNS += ".";
        }
        sNS += nsArray[i];
        // 依次创建构造命名空间对象（假如不存在的话）的语句
        // 比如先创建Kmf，然后创建Kmf.form，依次下去JavaScript 的命名空间
        sEval += "if (typeof(" + sNS + ") == 'undefined') " + sNS + " = new Object();";
    }
    if (sEval != "") {
        eval(sEval);
    }
};

/**
 * 判断是否为顶部页面
 *
 * @param w
 * @returns {boolean}
 */
hait.isTop = function (w) {
    w = w || window;
    // 检测是否能够获取parent，如果不能（跨域），就直接返回true即可
    try {
        parent.hait;
    } catch (e) {
        return true;
    }
    return (w.parent == w.self || !(w.parent != w.self && parent.hait && parent.hait.description == 'Hait UI Framework'));
};

/**
 * 导入组件
 *
 * @param cls
 */
hait.register = function (cls) {
    // 从缓存中获取该对象的定义数据
    var isRegister = $(document.body).data(cls);
    if (isRegister) {
        // 已经创建了该对象，就不再重复创建了
        return;
    }
    var cachedScript = hait.cache.get(cls, 'script');
    if (cachedScript) {
        // 如果不存在，并且没有创建过才初始化
        eval(cachedScript);
        // 执行成功后，注册到当前页面控件列表，避免重复创建对象
        $(document.body).data(cls, "register");
        return;
    }

    var jsPath = cls;
    // 将所有.换成/
    while (true) {
        jsPath = jsPath.replace(".", "/");
        if (jsPath.indexOf(".") == -1) {
            break;
        }
    }
    // 组成最终的JS详细地址
    jsPath = BASE_PATH + "/frame/" + jsPath + ".js";
    hait._loadScript({
        url: jsPath,
        async: false,
        success: function (data) {
            // 如果返回数据为空，就什么也不做
            if (!data) {
                return;
            }
            hait.cache.set(cls, 'script', data);
            eval(data);
            hait.log.info('组件[' + cls + ']已读取');
        }
    });
};

/**
 * 导入资源文件
 *
 * @param path
 */
hait.resource = function (path) {
    // 从缓存中获取该对象的定义数据
    var cacheResource = hait.cache.get(path, "resource");
    var isRegister = $(document.body).data(path);
    if (isRegister) {
        // 已经创建了该对象，就不再重复创建了
        return;
    }
    if (cacheResource) {
        // 如果不存在，并且没有创建过才初始化
        eval(cacheResource);
        // 执行成功后，注册到当前页面控件列表，避免重复创建对象
        $(document.body).data(path, "register");
        return;
    }
    hait._loadScript({
        url: path,
        async: false,
        success: function (data) {
            // 如果返回数据为空，就什么也不做
            if (!data) {
                return;
            }
            hait.cache.set(path, "resource", data);
            eval(data);
            hait.log.info('资源[' + path + ']已读取');
        }
    });
};

/**
 * 导入资源文件到网页头中
 *
 * @param path
 */
hait.addHead = function (path) {
    // 如果连接中没有点，那么这是一个错误连接，直接返回
    if (path.lastIndexOf(".") == -1) {
        return;
    }
    // 判断是什么类型的文件，目前仅仅支持css和js
    var type = path.substring(path.lastIndexOf(".") + 1);
    if (type.indexOf("?") >= 0) {
        type = type.substring(0, type.indexOf("?"));
    }
    var file = null;
    if (type == "js") {
        var scripts = document.getElementsByTagName("script");
        // 如果已经存在脚本元素，那么就进行查询是否已经重复
        if (scripts != null && scripts.length > 0) {
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].src.indexOf(path) >= 0) {
                    return;
                }
            }
        }
        // 创建一个新的脚本元素
        file = document.createElement("script");
        file.setAttribute("type", "text/javascript");
        file.setAttribute("src", path);
    } else if (type == "css") {
        var links = document.getElementsByTagName("link");
        // 如果已经存在样式元素，那么就进行查询是否已经重复
        if (links != null && links.length > 0) {
            for (var i = 0; i < links.length; i++) {
                if (links[i].href.indexOf(path) >= 0) {
                    return;
                }
            }
        }
        // 创建一个新的样式元素
        file = document.createElement("link");
        file.setAttribute("rel", "stylesheet");
        file.setAttribute("type", "text/css");
        file.setAttribute("href", path);
    }
    // 如果运行到这里，file依然不存在，那么直接返回
    if (file == null) {
        return;
    }
    // 将该新元素加入到head元素中
    document.getElementsByTagName("head")[0].appendChild(file);
};

/**
 * 私有方法:获取资源文件
 *
 * @param p
 * @private
 */
hait._loadScript = function (p) {
    var _f = p.success || function () {
    };
    $.ajax({
        url: p.url,
        dataType: 'text',
        async: p.async,
        error: function (jqXHR, textStatus, exception) {
            hait.log.info('读取 ' + p.url + ' 错误!', exception);
        },
        success: function (d) {
            _f(d);
        }
    });
};

/**
 * 根据编号获取组件
 */
hait.getCompById = function (compId) {
    if (window.compsById == undefined) {
        return null;
    }
    return window.compsById[compId];
};

/**
 * 仅仅用表单元素的获取，名称为表单名称.元素名称
 */
hait.getCompByName = function (compName) {
    if (window.compsByName == undefined) {
        return null;
    }
    return window.compsByName[compName];
};

/**
 * 初始化数据字典
 */
hait.initDict = function () {
    // 如果已经存在数据字典对象了，那么直接返回
    if (window.dict != null) {
        return;
    }

    // 从缓存中获取数据字典内容
    var cachedDict = hait.cache.get("content", "dict");

    // 如果缓存中没有该数据，那么直接进行初始化
    if (cachedDict == null) {
        hait.log.info('获取数据字典原始数据');
        $.ajax({
            url: DICT_REQUEST_URL,
            dataType: 'text',
            async: false,
            success: function (datas) {
                cachedDict = datas;
                hait.cache.set("content", "dict", cachedDict);
            }
        });
    }

    // 开始初始化数据字典
    hait.register("hait.util.Map");
    // 初始化数据字典
    window.dict = new hait.util.Map();

    var json = $.parseJSON(cachedDict);
    // 循环将里面的数据保存到缓存中
    for (var key in json) {
        // 将获取到的字典信息添加到当前的页面缓存中去
        if (!window.dict.containsKey(key)) {
            window.dict.put(key, []);
        }
        var items = json[key];
        for (var i = 0; i != items.length; i++) {
            var item = items[i];
            window.dict.get(key).push({
                val: item["item_val"],
                text: item["item_name"]
            });
        }
    }
    hait.log.info('初始化数据字典成功');
};

/**
 * 根据数据字典代码获取字典信息
 */
hait.getDictByCode = function (code) {
    // 初始化数据字典
    hait.initDict();
    return window.dict.get(code);
};

/**
 * 用户授权登录
 */
function userAuthLogin() {
    $.ajax({
        url: baseUrl + "/cffc/wechat/wxauth.do",
        type: 'POST',
        contentType: "application/json;charset=UTF-8",
        dataType:"json",
        success: function (data) {
            window.location.href = data.data;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr);
            console.log(ajaxOptions);
            console.log(thrownError);
        }
    });
}

/**
 * 根据数据字典代码和名称获得对应的值
 */
hait.getDictByCodeAndName = function (code, name) {
    var dicts = hait.getDictByCode(code);
    for (var i = 0; i < dicts.length; i++) {
        var dict = dicts[i];
        if (dict["val"] == name) {
            return dict["text"];
        }
    }
    return null;
};

/**
 * 解析url中参数，将之封装为json
 */
hait.analyzeURL = function (url) {
    var params = {};

    if (url == undefined) {
        return params;
    }

    // 将url中?号以前的数据全部删除
    var thisUrl = url;
    if (url.indexOf("?") != -1) {
        thisUrl = thisUrl.substring(url.indexOf("?") + 1);
    }
    // 使用&将之转换为数组
    thisUrl = thisUrl.split("&");
    for (var i = 0; i < thisUrl.length; i++) {
        // 分离出其中的键值
        var key = thisUrl[i].split("=")[0];
        var val = thisUrl[i].split("=")[1];
        params[key] = val;
    }
    return params;
};

/**
 * 转换字符串中的param部分的内容
 */
hait.parseParam = function (param, type) {
    var separate = ",";
    // 如果type为空，那么默认为json
    if (type == null) {
        type = "json";
    }

    // 根据情况配置不同的分隔符
    if (type == "url") {
        separate = "&";
    } else if (type == "json") {
        separate = ",";
    }
    var webParams = hait.analyzeURL(window.location.href);
    // 如果查询到参数中存在param的情况，那么认为，参数来源于web参数，这里需要转换
    while (param.indexOf("param.") != -1) {
        var startIndex = param.indexOf("param.");
        var endIndex = param.indexOf(separate, startIndex);
        var paramName = endIndex == -1 ? param.substring(startIndex) : param.substring(startIndex, endIndex);

        var paramValue = webParams[paramName.trim().substring(6)];

        // 根据情况进行不同的替换方式
        if (type == "url") {
            param = param.replace(paramName, paramValue);
        } else if (type == "json") {
            param = param.replace(paramName, "'" + paramValue + "'");
        } else {
            param = param.replace(paramName, paramValue);
        }
    }

    // 如果json，那么直接返回转换结果
    return type == "json" ? eval("[{" + param + "}]")[0] : param;
};

/**
 * 获得当前token
 */
hait.getToken = function () {
    // 从本地缓存中去获取
    var token = window.localStorage.getItem("token");
    if (token != null && token.length > 0) {
        return token;
    }

    // 从链接中获取
    var params = hait.analyzeURL(window.location.href);
    var token = params["token"];
    if (token != null && token.length > 0) {
        window.localStorage.setItem("token", token);
    }
    return token;
};

/**
 * 获取当前客户信息
 */
hait.getCurrentUser = function () {
    // 从本地缓存中获取
    var user = window.localStorage.getItem("current_user");
    if (user != null && user.length > 0) {
        return JSON.parse(user);
    }
    // 根据token去远程获取
    var token = hait.getToken();
    if (token == null || token.length == 0) {
        alert("当前token为空，无法获取");
        return;
    }
    request({
        async: false,// 同步调用
        data: [{
            funcId: GET_CURRENT_USER_FUNCTION
        }],
        func: function (data) {
            var response = data.responses[0];
            if (response.flag <= 0) {
                return null;
            }
            user = response.items[0];
            window.localStorage.setItem("current_user", JSON.stringify(user));

        }
    });
    return user;
};

/**
 * 获取当前客户信息
 */
hait.getCurrentWechatUser = function () {
    // 从本地缓存中获取
    var user = window.localStorage.getItem("current_wechat_user");
    if (user != null && user.length > 0) {
        return JSON.parse(user);
    }
    // 根据token去远程获取
    var token = hait.getToken();
    if (token == null || token.length == 0) {
        alert("当前token为空，无法获取");
        return;
    }
    request({
        async: false,// 同步调用
        data: [{
            funcId: GET_CURRENT_WECHAT_USER_FUNCTION
        }],
        func: function (data) {
            var response = data.responses[0];
            if (response.flag <= 0) {
                return null;
            }
            user = response.items[0];
            window.localStorage.setItem("current_wechat_user", JSON.stringify(user));

        }
    });
    return user;
};

/**
 * 设置当前用户
 */
hait.setCurrentUser = function (user) {
    window.localStorage.setItem("current_user", JSON.stringify(user));
};

/**
 * 发送信息到目标对象
 */
hait.postMessage = function (obj, type, params) {
    if (params == null) {
        params = {};
    }
    params.type = type;
    obj.postMessage(JSON.stringify(params), "*");
};

/**
 * hait.cache 缓存对象
 */
hait.cache = (!hait.isTop(window)) ? parent.hait.cache : (function () {
    return {
        set: function (id, type, obj) {
            hait.log.info('保存数据到缓存对象 hait.cache.' + type + ':' + id);
            // 从配置文件中获取缓存方式
            var cacheType = CACHE_TYPE;
            if (cacheType == "page") {
                // 如果该类别为空，那么就初始化一个
                if (this[type] == null) {
                    this[type] = {};
                }
                // 将这个值保存起来
                this[type][id] = obj;
            } else if (cacheType == "session") {
                sessionStorage.setItem(type + "#" + id, obj);
            } else if (cacheType == "local") {
                localStorage.setItem(type + "#" + id, obj);
            }
        },
        get: function (id, type) {
            hait.log.info('从缓存对象读取数据 hait.cache.' + type + ':' + id);
            var cacheType = CACHE_TYPE;
            if (cacheType == "page") {
                if (this[type] == null) {
                    return null;
                }
                return this[type][id];
            } else if (cacheType == "session") {
                return sessionStorage.getItem(type + "#" + id);
            } else if (cacheType == "local") {
                // 此种情况需要设置自动重置机制，每日重置一次
                // 获取过期时间
                var expiredTime = localStorage.getItem("FRAME_EXPIRED_TIME");
                if (expiredTime == null || expiredTime.length == 0) {
                    // 设置明天凌晨4点59分59秒为过期时间
                    var expiredDate = new Date();
                    expiredDate.setDate(expiredDate.getDate() + 1);
                    expiredDate.setHours(4);
                    expiredDate.setMinutes(59);
                    expiredDate.setSeconds(59);
                    expiredTime = expiredDate.getTime();
                    localStorage.setItem("FRAME_EXPIRED_TIME", expiredTime);
                }
                // 获得当前时间
                var currentTime = new Date().getTime();
                if (currentTime > expiredTime) {
                    // 获取缓存中的主题、token
                    var theme = localStorage.getItem("theme");
                    var token = localStorage.getItem("token");
                    // 清除缓存
                    localStorage.clear();
                    // 主题、token不能清除掉
                    localStorage.setItem("theme", theme);
                    localStorage.setItem("token", token);
                }
                // 返回对应值
                return localStorage.getItem(type + "#" + id);
            } else {
                return null;
            }
        },
        remove: function (id, type) {
            var cacheType = CACHE_TYPE;
            if (cacheType == "page") {
                if (this[type] == null) {
                    return;
                }
                delete this[type][id];
            } else if (cacheType == "session") {
                sessionStorage.removeItem(type + "#" + id);
            } else if (cacheType == "local") {
                localStorage.removeItem(type + "#" + id);
            }
        },
        clear: function (type) {
            hait.log.info('清空缓存');
            var cacheType = CACHE_TYPE;
            if (cacheType == "page") {
                if (type)
                    this[type] = {};
            } else if (cacheType == "session") {
                sessionStorage.clear();
            } else if (cacheType == "local") {
                localStorage.clear();
            }
        }
    };
})();

/**
 * 日志对象，全部通过谷歌浏览器的Console实现
 */
hait.log = (!hait.isTop(window)) ? parent.hait.log : (function () {
    return {
        debug: function (msg) {
            if (window.console) {
                console.log(msg);
            }
        },
        info: function (msg) {
            if (window.console) {
                console.log(msg);
            }
        },
        warn: function (msg) {
            if (window.console) {
                console.log(msg);
            }
            alert(msg);
        },
        error: function (msg) {
            if (window.console) {
                console.log(msg);
            }
            alert(msg);
        }
    };
})();

/**
 * cookie操作对象
 */
hait.cookie = (function () {
    return {
        get: function (key) {
            var cookies = document.cookie.split(";");
            var val = null;
            for (var i = 0; i < cookies.length; i++) {
                // 每个元素都是键值的
                var index = cookies[i].indexOf("=");
                var cookieKey = cookies[i].substring(0, index).trim();
                var cookieVal = cookies[i].substring(index + 1).trim();
                if (cookieKey == key) {
                    val = cookieVal;
                    break;
                }
            }
            return val;
        }
    };
})();

/**
 * 为JS系统对象增加一些常用方法
 */
Function.prototype.inherit = function (parent) {
    this.prototype = new parent();
    this.prototype.constructor = this;
};
String.prototype.replaceCharAt = function (idx, str) {
    return this.substring(0, idx) + str.toString() + this.substring(idx + 1, this.length);
};

String.prototype.trim = function () {
    return this.replace(/^\s*/, '').replace(/\s*$/, '');
};

/**
 * 将拼接jquery选择器时，需要对内部字符进行转义，比如.要写成\\.
 */
String.prototype.escapeJquerySelector = function () {
    // jquery选择器中的特殊字符
    var jquerySpecialChars = [".", "#", ",", "[", "]", ">"];
    var curStr = this;
    for (var i = 0; i < jquerySpecialChars.length; i++) {
        var jquerySpecialChar = jquerySpecialChars[i];
        if (curStr.indexOf(jquerySpecialChar) >= 0) {
            curStr = curStr.replaceAll(jquerySpecialChar, "\\" + jquerySpecialChar);
        }
    }
    return curStr;
};

String.prototype.deleteLastComma = function () {
    if (this.charAt(this.length - 1) == ",") {
        return this.substring(0, this.length - 1);
    } else {
        return this;
    }
};
String.prototype.replaceAll = function (reallyDo, replaceWith) {
    var returnStr = this;
    // 如果没有查到这个数据，那么直接返回
    if (returnStr.indexOf(reallyDo) == -1) {
        return returnStr;
    }
    // 替换方式为，先拆分为数组，然后再组合
    var returnArray = returnStr.split(reallyDo);
    return returnArray.join(replaceWith);
};
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds()
        // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

// 为数组对象增加根据下标删除元素的方法
Array.prototype.remove = function (dx) {
    if (isNaN(dx) || dx > this.length) {
        return false;
    }
    for (var i = 0, n = 0; i < this.length; i++) {
        if (this[i] != this[dx]) {
            this[n++] = this[i];
        }
    }
    this.length -= 1;
};

// 根据页面情况对当前对象进行初始化工作
if (!(hait.isTop(window))) {
    hait.log = parent.hait.log; // 引用父页面log 对象
    hait.cache = parent.hait.cache;
    hait.loader = parent.hait.loader;
}

// 初始化顶级对象
hait.register("hait.base.Component");

/**
 * 系统初始化时候的操作
 */
$(function () {
    // 隐藏所有的权限功能
    $("*[auth-code]").hide();

    // 给整个屏幕增加一个遮罩，等所有组件都初始化完成后，再显示出来，增加体验
    var containerMask = $("<div class='hait-dialog-shadow'></div>");
    containerMask.css("opacity", "1");
    containerMask.css("z-index", "999");
    containerMask.css("display", "block");
    containerMask.css("top", "0px");
    containerMask.css("left", "0px");
    $(document.body).append(containerMask);
    $(document.body).css("display", "block");

    // 将页面中所有拥有hait_type属性的元素读取出来进行转换
    var converts = $("*[hait-type]");

    // 清除表单元素项，因为这些元素，由表单来完成绘制
    var comps = [];
    converts.each(function () {
        if (this.form) {
            // 不处理表单内的元素，因为他们要让表单对象去处理
            return;
        }
        comps.push(this);
    });

    // 循环处理这些需要初始处理的元素
    for (var i = 0; i < comps.length; i++) {

        var compType = $(comps[i]).attr("hait-type");
        // 载入这个组件
        hait.register(compType);
        try {
            // 初始化该对象
            var comp = eval("new " + compType + "();");
            // 转换这个对象
            comp.convert(comps[i]);
        } catch (e) {
            hait.log.info("组件[" + compType + "初始化失败!]");
        }
    }

    // 获取当前页面的权限
    var pageFuncAuth = hait.cookie.get("pageFuncAuth");
    if (pageFuncAuth != null && pageFuncAuth.length > 0) {
        var pageFuncAuthArr = $.parseJSON(decodeURIComponent(pageFuncAuth));
        for (var i = 0; i < pageFuncAuthArr.length; i++) {
            var pageFuncAuthJSON = pageFuncAuthArr[i];
            var authCode = pageFuncAuthJSON["auth_code"];
            // 找到对应元素，并显示
            $("[auth-code=" + authCode + "]").show();
        }
    }
    // 将所有界面上所有没有显示功能权限组件进行删除操作
    $("*[auth-code]:hidden").remove();
    containerMask.fadeOut("fast", function () {
        $(this).remove();
    });
});