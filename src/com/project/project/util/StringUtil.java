package com.cffc.manage.util;

import com.haitsoft.framework.data.context.DataContext;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 字符串判断工具
 * 
 * @author pandong
 * @date 2016年8月25日 下午3:51:13
 * @copyright(c) yunlaila.com.cn
 */
public class StringUtil {

	/**
	 * 判断是否不为空
	 * 
	 * @param str
	 * @return
	 */
	public static boolean isNotBlank(String str) {
		return !isBlank(str);
	}

	/**
	 * 判断是否为空
	 * 
	 * @param str
	 * @return
	 */
	public static boolean isBlank(String str) {
		return (str == null) || "".equals(str) || "null".equals(str);
	}

	/**
	 * 判断是否含有空格和单引号，因为有可能就有可能存在注入攻击
	 * 
	 * @param text
	 * @return
	 */
	public static boolean isHaveBlank(String text) {
		// 如果为空， 则不肯定没有空格
		if (isBlank(text)) {
			return false;
		}
		return text.indexOf(" ") == -1 && text.indexOf("'") == -1 ? false : true;
	}

	/**
	 * 从参数中获取字符串
	 * 
	 * @param params
	 * @param key
	 * @return
	 */
	public static String getString(Map params, String key) {
		return getString(params, key, "");
	}

	public static String getString(Map params, String key, String defaultVal) {
		if (params == null) {
			return defaultVal;
		}
		Object val = params.get(key);
		return val == null || "".equals(val.toString().trim()) ? defaultVal : val.toString();
	}

	/**
	 * 从参数中获取int数字
	 * 
	 * @param params
	 * @param key
	 * @return
	 */
	public static int getInt(Map params, String key) {
		return getInt(params, key, 0);
	}

	public static int getInt(Map params, String key, int defaultVal) {
		if (params == null || params.get(key) == null || params.get(key).toString().length() == 0) {
			return defaultVal;
		}
		String curInt = params.get(key).toString();
		if (curInt.indexOf(".") >= 0) {
			curInt = curInt.substring(0, curInt.indexOf("."));
		}
		return Integer.parseInt(curInt);
	}

	/**
	 * 从参数中获取double数字
	 * 
	 * @param params
	 * @param key
	 * @return
	 */
	public static double getDouble(Map params, String key) {
		return getDouble(params, key, 0.00);
	}

	public static double getDouble(Map params, String key, double defaultVal) {
		if (params == null || params.get(key) == null || params.get(key).toString().length() == 0) {
			return defaultVal;
		}
		return Double.parseDouble(params.get(key).toString());
	}

	/**
	 * 精确格式化成金额格式(例如：1.199999 转成：1.2 )
	 * 
	 * @param obj
	 * @return
	 */
	public static double formatMoney(double obj) {
		String obj1 = new BigDecimal(obj).setScale(4, BigDecimal.ROUND_HALF_UP).toString();
		double obj2 = new BigDecimal(obj1).setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
		return obj2;
	}

	/**
	 * 判断是否是手机号码
	 * 
	 * @param obj
	 * @return
	 */
	public static boolean isPhone(String obj) {
		if (obj == null) {
			return false;
		}
		Pattern p = Pattern.compile("^1\\d{10}$");
		Matcher m = p.matcher(obj);
		return m.matches();
	}

	/**
	 * 判断是否是固定电话号码
	 * 
	 * @param obj
	 * @return
	 */
	public static boolean isTelPhone(String obj) {
		if (obj == null) {
			return false;
		}
		Pattern p = Pattern.compile("^(0[0-9]{2,3}\\-)?([2-9][0-9]{6,7})+(\\-[0-9]{1,4})?$");
		Matcher m = p.matcher(obj);
		return m.matches();
	}

	/**
	 * 判断是否是Email
	 * 
	 * @param obj
	 * @return
	 */
	public static boolean isEmail(String obj) {
		if (obj == null) {
			return false;
		}
		Pattern p = Pattern.compile("^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$");
		Matcher m = p.matcher(obj);
		return m.matches();
	}

	/**
	 * 删除最后一个字符
	 * 
	 * @param str
	 * @return
	 */
	public static String deleteLastChar(String str) {
		if (str.length() > 0) {
			return str.substring(0, str.length() - 1);
		}
		return str;

	}

	/**
	 * 删除某个拼接字符中的一个值
	 * 
	 * @param handldChar
	 *            要处理的拼接字符串
	 * @param deleteChar
	 *            要删除的值
	 * @param splitChar
	 *            拼接符号
	 * @return
	 */
	public static String deleteCharForSplit(String handldChar, String deleteChar, String splitChar) {
		if (isBlank(handldChar) || isBlank(deleteChar) || isBlank(splitChar)) {
			return handldChar;
		}
		List<String> resultList = new ArrayList<String>();
		String[] handleCharArr = handldChar.split(splitChar);
		for (String temp : handleCharArr) {
			if (temp.equals(deleteChar)) {
				continue;
			}
			resultList.add(temp);
		}

		if (resultList.size() == 0) {
			return "";
		}

		// 把List中的值拼接成字符串
		String result = "";
		for (String temp : resultList) {
			result += temp + splitChar;
		}
		result = result.substring(0, result.length() - 1);
		return result;
	}

	/**
	 * 得到参数长度的星号*
	 * 
	 * @param length
	 * @return
	 */
	private static String getStarMark(int length) {
		String valueString = "";
		for (int i = 0; i < length; i++) {
			valueString += "*";
		}
		return valueString;
	}

	/**
	 * 混淆名称：手机号码/邮箱号码 或者普通昵称
	 * 
	 * @param nickName
	 * @return
	 */
	public static String confusionName(Object nickName) {
		String newName = "";
		if (nickName != null && !nickName.toString().trim().equals("")) {
			String name = nickName.toString();
			// 混淆昵称
			if (isEmail(name)) {// 邮箱的处理
				int endIndex = name.indexOf('@');
				String temp = name.substring(0, endIndex);
				if (temp.length() < 5) {
					newName = temp.substring(0, 1) + getStarMark(temp.length() - 1) + name.substring(endIndex);
				} else {
					newName = temp.substring(0, 2) + getStarMark(temp.length() - 3) + temp.substring(temp.length() - 1)
							+ name.substring(endIndex);
				}

			} else if (isPhone(name)) { // 手机号码的处理
				newName = name.substring(0, 3) + "****" + name.substring(7);
			} else {
				// 新昵称的处理
				if (name.length() > 2) {
					newName = name.substring(0, 1) + getStarMark(name.length() - 2) + name.substring(name.length() - 1);
				} else {
					newName = name.substring(0, 1) + "*";
				}

				// newName = name;//新昵称不处理
			}
		}
		return newName;
	}

	/**
	 * 用于方便替换item中的数据字典元素
	 * 
	 * @param item
	 * @param fieldName
	 * @param dictCode
	 */
	public static void changeDict(Map item, String fieldName, String dictCode) {
		if (item == null || item.get(fieldName) == null || DataContext.getDict(dictCode) == null) {
			return;
		}
		item.put(fieldName + "_text", DataContext.getDict(dictCode, item.get(fieldName)));
	}
	
	/**
	 * 用于方便替换item中的数据字典元素
	 * 
	 * @param item
	 * @param fieldName
	 * @param dictCode
	 */
	public static String getDictValue(Map item, String fieldName, String dictCode) {
		if (item == null || item.get(fieldName) == null || DataContext.getDict(dictCode) == null) {
			return "";
		}
		return DataContext.getDict(dictCode, item.get(fieldName));
	}

	public static String getDictValue(int fieldVal, String dictCode) {
		if (DataContext.getDict(dictCode) == null) {
			return "";
		}
		return DataContext.getDict(dictCode, fieldVal);
	}

	/**
	 * 将单个参数值替换为多个参数值
	 * 
	 * @param fieldVal
	 * @return 1,2,3 --> '1','2','3'
	 */
	public static String changeMultipleParam(String fieldVal) {
		String[] vals = fieldVal.split(",");
		StringBuffer result = new StringBuffer();
		for (int i = 0; i < vals.length; i++) {
			result.append("'" + vals[i] + "',");
		}
		result = result.deleteCharAt(result.length() - 1);
		return result.toString();
	}

	public static String changeMultipleParam(Map params, String field) {
		String fieldVal = getString(params, field);
		String[] vals = fieldVal.split(",");
		StringBuffer result = new StringBuffer();
		for (int i = 0; i < vals.length; i++) {
			result.append("'" + vals[i] + "',");
		}
		result = result.deleteCharAt(result.length() - 1);
		return result.toString();
	}

	/**
	 * 判断是否为数字
	 * 
	 * @param str
	 * @return
	 */
	public static boolean isNumeric(String text) {
		Pattern pattern = Pattern.compile("[+-]?\\d*[.]?\\d*");
		Matcher isNum = pattern.matcher(text);
		if (!isNum.matches()) {
			return false;
		}
		return true;
	}

	/**
	 * 判断是否为汉字
	 * 
	 * @param text
	 * @return
	 */
	public static boolean isChinese(String text) {
		Pattern pat = Pattern.compile("[\u4e00-\u9fa5]*");
		Matcher matcher = pat.matcher(text);
		if (!matcher.matches()) {
			return false;
		}
		return true;
	}

	/**
	 * 如何含有.00和.0就直接取消，否则保留小数点后两位
	 */
	public static String formatNumberString(Map params, String fieldName) {
		String number = getString(params, fieldName);
		return formatNumberString(number);
	}
	
	/**
	 * 把0替换成""
	 * @param params
	 * @param fieldName
	 * @return
	 */
	public static String formatNumberStringWithoutZero(Map params, String fieldName) {
		String number = formatNumberString(getString(params, fieldName));
		return "0".equals(number) ? "" : number;
	}

	public static String formatNumberString(double fieldValue) {
		return formatNumberString(new Double(fieldValue).toString());
	}

	public static String formatNumberString(String fieldValue) {
		String number = fieldValue;
		if ("".equals(number) || number.isEmpty()) {
			return "";
		}
		if(number.indexOf(".") == -1){
			return number;
		}
		if (number.endsWith(".00")) {
			return number.replace(".00", "");
		}

		if (number.endsWith(".0")) {
			return number.replace(".0", "");
		}

		return new DecimalFormat("0.00").format(Double.parseDouble(number));
	}

	public static String formatNumberStringWithZero(Map params, String fieldName) {
		String number = getString(params, fieldName);
		if ("".equals(number) || number.isEmpty()) {
			return "0";
		}
		if(number.indexOf(".") == -1){
			return number;
		}
		if (number.endsWith(".00")) {
			return number.replace(".00", "");
		}

		if (number.endsWith(".0")) {
			return number.replace(".0", "");
		}

		return new DecimalFormat("0.00").format(Double.parseDouble(number));
	}
	
	/**
	 * 判断时间是否为指定格式
	 * @param str
	 * @param format
	 * @return
	 */
	public static boolean isValidDate(String str,String format) {
		boolean convertSuccess = true;
		SimpleDateFormat dateFormat = new SimpleDateFormat(format);
		try {
			dateFormat.setLenient(false);
			dateFormat.parse(str);
		} catch (Exception e) {
			convertSuccess = false;
		}
		return convertSuccess;
	}

	/**
	 * 去掉字符串最后一位逗号
	 * @param val
	 * @return
	 */
	public static String endWithoutComma(String val){
		if(val == null || val.length() == 0){
			return "";
		}
		return val.endsWith(",") ? val.substring(0, val.length() - 1) : val;
	}
}
