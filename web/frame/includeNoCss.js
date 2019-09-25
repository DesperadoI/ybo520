/**
 * 系统配置文件
 */
var CACHE_TYPE = "page";// 缓存方式page,local
var BASE_PATH = "/cffc"; // 框架地址
var DICT_REQUEST_URL = BASE_PATH + "/common/get_dicts.do"; // 查询数据字典接口
var IMG_UPLOAD_URL = "/upload_img/data.do"; // 图片上传接口
var GET_CURRENT_USER_FUNCTION = "hex_login_getCurrentUserInfoFunction"; // 获得用户信息的功能号
var GET_CURRENT_WECHAT_USER_FUNCTION = "hex_login_getCurrentWechatUserInfoFunction"; // 获得用户信息的功能号
var HOST_URL = window.location.href.substring(0, window.location.href.indexOf("//") + 2) + window.location.host + BASE_PATH;

/**
 * 主服务器
 */
var DEFAULT_SERVER = BASE_PATH + "/common/data.do"; // 主服务器

/**
 * 登录退出地址
 */
var LOGIN_URL = BASE_PATH + "/login/login.do";
var LOGOUT_URL = BASE_PATH + "/login/logout.do";

// 导入框架文件
document.write('<script src="' + BASE_PATH + '/frame/frameNoCss.js"></script>');