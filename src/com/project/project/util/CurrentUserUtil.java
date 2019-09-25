package com.cffc.manage.util;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

public class CurrentUserUtil {

	/**
	 * 获取用户编号
	 * 
	 * @param params
	 * @return
	 */
	public static String getUserId(Map params) {
		return params.get("session.user_id").toString();
	}

	/**
	 * 获得用户名称
	 * 
	 * @param params
	 * @return
	 */
	public static String getUserName(Map params) {
		return params.get("session.user_name").toString();
	}

	/**
	 * 获得登录代码
	 * 
	 * @param params
	 * @return
	 */
	public static String getLoginCode(Map params) {
		return params.get("session.login_code").toString();
	}

	/**
	 * 获得当前日期
	 * 
	 * @return
	 */
	public static String getCurrentDate() {
		return new SimpleDateFormat("yyyy-MM-dd").format(new Date());
	}

	/**
	 * 获得当前时间
	 * 
	 * @return
	 */
	public static String getCurrentTime() {
		return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
	}

	/**
	 * 获取岗位编号
	 * 
	 * @param params
	 * @return
	 */
	public static String getRoleId(Map params) {
		return params.get("session.role_id").toString();
	}

	/**
	 * 获取岗位名称
	 * 
	 * @param params
	 * @return
	 */
	public static String getRoleName(Map params) {
		return params.get("session.role_name").toString();
	}

    /**
     * 获取Token
     * @param params
     * @return
     */
    public static String getToken(Map params) {
        return params.get("session.login_token").toString();
    }
}
