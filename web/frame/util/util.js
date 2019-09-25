var baseUrl = "http://cdss.chinayunsoft.com";
// var baseUrl = "http://des.dev.chinayunsoft.com";

//去掉金额字段中的.00或.0
function formatMoney(val) {
    if (val.endsWith(".00") || val.endsWith(".0")) {
        return val.substring(0, val.indexOf("."));
    }
    return val;
}

//去掉以小数点为结尾的数字中的小数点
function clearPointNum(val) {
    if (val.endsWith(".")) {
        return val.substring(0, val.indexOf("."));
    }
    return val;
}

//去掉字符串最后一位逗号
function endWithoutComma(val) {
    if (val == null || val.length == 0) {
        return "";
    }
    return val.endsWith(",") ? val.substring(0, val.length - 1) : val;
}

//批量操作时格式化in中值
function changeBatchId(row) {
    if (row == null || row.length == 0) {
        return "''";
    }
    var ids = "";
    for (var i = 0; i < row.length; i++) {
        ids += "'" + row[i].user_id + "',";
    }
    if (ids.endsWith(",")) {
        ids = ids.substring(0, ids.length - 1);
    }
    return ids;
}

/**
 * 只能输入数字且最多两位小数
 * @param obj
 */
function clearNoNum(obj) {
    obj.value = obj.value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
    obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
    obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数
    if (obj.value.indexOf(".") < 0 && obj.value != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
        obj.value = parseFloat(obj.value);
    }
}

/**
 * 只能输入数字
 * @param obj
 */
function onlyNumber(obj) {
    obj.value = obj.value.replace(/[^\d]/g, "");
}

/**
 * 只能输入手机号
 * @param obj
 */
function onlyMobilePhone(obj) {
    obj.value = obj.value.replace(/[^\d]/g, "");
    obj.value = obj.value.length > 11 ? obj.value.substring(0, 11) : obj.value;
}

// 格式化时间字段 yyyy-MM-dd hh:mm
function formatDatetime(val) {
    if (val == null || val == "") {
        return "";
    }
    return val.substring(0, 16);
}

// 回车响应页面searchData的查询方法
function enterKey() {
    $(document).keydown(function (event) {
        if (event.keyCode == 13 && document.activeElement.id != 'gridLimitPage') {
            searchData();
        }
    });
}

// url获取参数
function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

// 计算之前天数
function getAfterDate(date1, AddDayCount) {
    var dd = new Date(date1.replace(/-/g, '/'));
    dd.setDate(dd.getDate() + AddDayCount);// 获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;// 获取当前月份的日期
    var d = dd.getDate();
    if (m < 10) {
        m = "0" + m;
    }
    if (d < 10) {
        d = "0" + d;
    }
    return y + "-" + m + "-" + d;
}

// 设置时间组件的时间(dateId:时间组件的id, day:向前（向后）移动的天数)
function changeDate(dateId, day) {
    var date = getAfterDate(day);
    hait.getCompById(dateId).setValue(date);
    return date;
}

// 设置时间组件的时间为当月第一天(dateId:时间组件的id,)
function setFirstDay(dateId) {
    var dd = new Date();
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;// 获取当前月份的日期
    if (m < 10) {
        m = "0" + m;
    }
    var first = y + "-" + m + "-" + "01";
    hait.getCompById(dateId).setValue(first);
    return first;
}

// 获取当月第一天
function getMonthFirstDay() {
    var dd = new Date();
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;// 获取当前月份的日期
    if (m < 10) {
        m = "0" + m;
    }
    var first = y + "-" + m + "-" + "01";
    return first;
}

// 获取当前时间 yyyy-MM-dd HH:MM:SS
function getNowFormatTime() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + date.getHours() + seperator2 + date.getMinutes() + seperator2
        + date.getSeconds();
    return currentdate;
}

// 获取当前日期 yyyy-MM-dd
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

// 获取两个时间的相差小时数
function getDateHours(date1, date2) {
    date1 = new Date(date1.replace(/-/g, '/'));
    date2 = new Date(date2.replace(/-/g, '/'));
    var ms = Math.abs(date1.getTime() - date2.getTime());
    return ms / 1000 / 60 / 60;
}

// 获取两个时间的相差天数
function getDateDays(date1, date2) {
    date1 = new Date(date1.replace(/-/g, '/'));
    date2 = new Date(date2.replace(/-/g, '/'));
    var ms = Math.abs(date1.getTime() - date2.getTime());
    return Math.ceil(ms / 1000 / 60 / 60 / 24);
}

/**
 * 比较两个日期大小
 * @param date1
 * @param date2
 * @returns {boolean}
 */
function compareDate(date1, date2) {
    return ((new Date(date1.replace(/-/g, "\/"))) > (new Date(date2.replace(/-/g, "\/"))));
}

//验证手机号码是否正确
function isMobile(s) {
    var patrn = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
    if (!patrn.exec(s))
        return false;
    return true;
}

//身份证号合法性验证
//支持15位和18位身份证号
function IdentityCodeValid(code) {
    var city = {
        11: "北京",
        12: "天津",
        13: "河北",
        14: "山西",
        15: "内蒙古",
        21: "辽宁",
        22: "吉林",
        23: "黑龙江 ",
        31: "上海",
        32: "江苏",
        33: "浙江",
        34: "安徽",
        35: "福建",
        36: "江西",
        37: "山东",
        41: "河南",
        42: "湖北 ",
        43: "湖南",
        44: "广东",
        45: "广西",
        46: "海南",
        50: "重庆",
        51: "四川",
        52: "贵州",
        53: "云南",
        54: "西藏 ",
        61: "陕西",
        62: "甘肃",
        63: "青海",
        64: "宁夏",
        65: "新疆",
        71: "台湾",
        81: "香港",
        82: "澳门",
        91: "国外 "
    };
    var pass = true;

    if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
        pass = false;
    } else if (!city[code.substr(0, 2)]) {
        pass = false;
    } else {
        //18位身份证需要验证最后一位校验位
        if (code.length == 18) {
            code = code.split('');
            //∑(ai×Wi)(mod 11)
            //加权因子
            var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            //校验位
            var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
            var sum = 0;
            var ai = 0;
            var wi = 0;
            for (var i = 0; i < 17; i++) {
                ai = code[i];
                wi = factor[i];
                sum += ai * wi;
            }
            if (parity[sum % 11] != code[17]) {
                pass = false;
            }
        }
    }
    return pass;
}