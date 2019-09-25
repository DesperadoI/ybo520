package com.cffc.manage.util;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

public class WeChatUtil {
    //微信接口通用域名
    public final static String URL_WX_COMMON = "https://api.weixin.qq.com";

    //用户认证
    public final static String URL_WX_OAUTH = "https://open.weixin.qq.com/connect/oauth2/authorize";

    //获取经过认证后的用户openId
    public final static String URL_WX_OAUTH_OPENID = URL_WX_COMMON + "/sns/oauth2/access_token";

    // 获取微信access_token
    public final static String URL_WX_ACCESS_TOKEN = URL_WX_COMMON + "/cgi-bin/token";

    // 获取微信ticket
    public final static String URL_WX_OAUTH_TICKET = URL_WX_COMMON + "/cgi-bin/ticket/getticket";

    //获取已关注公众号的用户信息
    public final static String URL_WX_USER_HAVE_ATTENTION = URL_WX_COMMON + "/cgi-bin/user/info";

    //获取未关注公众号的用户信息
    public final static String URL_WX_USER_HAVE_NO_ATTENTION = URL_WX_COMMON + "/sns/userinfo";

    //获取未关注公众号的用户信息
    public final static String URL_WX_MINI = URL_WX_COMMON + "/sns/jscode2session";

    //发送模板消息
    public final static String URL_WX_TEMPLATE_SEND_MESSAGE = URL_WX_COMMON + "/cgi-bin/message/template/send";

    public static String expandURI(String var1, Map<String, String> var2) {
        return expandURI(var1, var2, true);
    }

    public static String expandURI(String var1, Map<String, String> var2, boolean encode) {
        try {
            List<String> list = new ArrayList<>();
            for (String key : var2.keySet()) {
                String value = var2.get(key) + "";
                list.add(key + "=" + (encode ? java.net.URLEncoder.encode(value, "UTF-8") : value));
            }
            return var1 + (list.size() > 0 ? ("?" + String.join("&", list)) : "");
        } catch (Exception e) {
            System.out.println("crash when WeChatUtil.expandURI() " + e);
            e.printStackTrace();
            return null;
        }
    }

    public static Map<String, String> getRequestParametersMap(HttpServletRequest request) {
        Map<String, String> map = new HashMap<>();
        Enumeration em = request.getParameterNames();
        while (em.hasMoreElements()) {
            String name = (String) em.nextElement();
            String value = request.getParameter(name);
            map.put(name, value);
        }
        return map;
    }

    public enum ErrCode {
        BUSY(-1, "系统繁忙，请稍候再试"),
        SUCCESS(0, "成功"),
        ERROR_ACCESS_TOKEN(40001, "AppSecret错误或access_token无效"),
        ERROR_NO_SUBSCRIBE(43004, "需要接收者关注");

        private int resultCode;
        private String resultMessage;

        ErrCode(int code, String msg) {
            this.resultCode = code;
            this.resultMessage = msg;
        }

        public int getCode() {
            return resultCode;
        }

        public String getMessage() {
            return resultMessage;
        }
    }
}
