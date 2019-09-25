package com.cffc.manage.util;

import com.alibaba.fastjson.JSONObject;
import com.haitsoft.framework.cache.bean.Cache;
import com.haitsoft.framework.cache.context.CacheContext;
import com.haitsoft.framework.core.util.HttpUtil;
import com.haitsoft.framework.core.util.MD5Util;
import com.haitsoft.framework.data.bean.DaoResult;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 微信公众号工具箱
 */
public class WeiXinPublicUtil {

    /**
     * 用户同意授权，获取code
     *
     * @param appId
     * @param url
     * @param scope
     * @return
     */
    public static String getOpenIdUrl(String appId, String url, String scope, String state) {
        String encode = "";

        // 有两种snsapi_userinfo&snsapi_base
        if (scope == null) {
            scope = "snsapi_base";
        }

        try {
            encode = java.net.URLEncoder.encode(url, "utf-8");
        } catch (UnsupportedEncodingException e) {
            encode = url;
        }

        return "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appId + "&redirect_uri=" + encode
                + "&response_type=code&scope=" + scope + "&state=" + state + "#wechat_redirect";
    }

    /**
     * 获取微信用户信息
     *
     * @param appId
     * @param secret
     * @param code
     * @return
     */
    public static Map getUserInfoByCode(String appId, String secret, String code) {
        String accessToken = null;
        String openId = null;

        // 首先到缓存中获取，查看是否存在
        Cache accessTokenCache = CacheContext.getContext().getCache("ACCESS_TOKEN_WEB_" + appId, 7000);
        if (accessTokenCache != null) {
            accessToken = (String) accessTokenCache.get("access_token");
        }

        // 如果依然为空，那么去微信获取
        if (accessToken == null) {
            // 通过get请求获取结果，并解析出其中的access_token
            DaoResult httpDaoResult = HttpUtil.get("https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + appId + "&secret=" + secret
                    + "&code=" + code + "&grant_type=authorization_code");
            // 如果发生错误，直接返回空即可
            if (httpDaoResult.getFlag() <= 0) {
                return null;
            }

            // 解析其中的JSON返回结果
            JSONObject json = JSONObject.parseObject(httpDaoResult.getMessage());

            // 查看是否发生了错误，如果存在，暂时不做任何处理，那么返回空即可
            String errCode = json.getString("errcode");
            if (errCode != null && errCode.length() > 0) {
                return null;
            }

            // 获得这个结果
            accessToken = json.getString("access_token");
            openId = json.getString("openid");
            // 保存该标识到缓存，避免反复去获取
            accessTokenCache.put("access_token", accessToken);
        }

        // 拉取客户信息
        DaoResult httpDaoResult = HttpUtil.get("https://api.weixin.qq.com/sns/userinfo?access_token=" + accessToken + "&openid=" + openId
                + "&lang=zh_CN");
        // 如果发生错误，直接返回空即可
        if (httpDaoResult.getFlag() <= 0) {
            return null;
        }

        // 解析其中的JSON返回结果
        JSONObject userJson = JSONObject.parseObject(httpDaoResult.getMessage());

        // 拼装返回结果
        Map weixinUser = new HashMap();
        weixinUser.put("openid", userJson.getString("openid"));
        weixinUser.put("nickname", userJson.getString("nickname"));
        weixinUser.put("headimgurl", userJson.getString("headimgurl"));
        return weixinUser;
    }

    /**
     * 获得公众号的统一登陆标识
     *
     * @param appId
     * @param secret
     * @return
     */
    public static String getPublicAccessToken(String appId, String secret) {
        String accessToken = null;

        // 首先到缓存中获取，查看是否存在
        Cache accessTokenCache = CacheContext.getContext().getCache("ACCESS_TOKEN_PUBLIC_" + appId, 7000);
        if (accessTokenCache != null) {
            accessToken = (String) accessTokenCache.get("access_token");
        }

        // 如果依然为空，那么去微信获取
        if (accessToken == null) {
            // 通过get请求获取结果，并解析出其中的access_token
            DaoResult httpDaoResult = HttpUtil.get("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId
                    + "&secret=" + secret);
            // 如果发生错误，直接返回空即可
            if (httpDaoResult.getFlag() <= 0) {
                return accessToken;
            }

            // 解析其中的JSON返回结果
            JSONObject json = JSONObject.parseObject(httpDaoResult.getMessage());

            // 查看是否发生了错误，如果存在，暂时不做任何处理，那么返回空即可
            String errCode = json.getString("errcode");
            if (errCode != null && errCode.length() > 0) {
                return null;
            }

            // 获得这个结果
            accessToken = json.getString("access_token");
            // 保存该标识到缓存，避免反复去获取
            accessTokenCache.put("access_token", accessToken);
        }

        return accessToken;
    }

    public static String getSignature(String jsapiTicket, String noncestr, String timestamp, String url) {
        String signature = "";

        // 注意这里参数名必须全部小写，且必须有序
        signature = "jsapi_ticket=" + jsapiTicket + "&noncestr=" + noncestr + "&timestamp=" + timestamp + "&url=" + url;

        try {
            MessageDigest crypt = MessageDigest.getInstance("SHA-1");
            crypt.reset();
            crypt.update(signature.getBytes("UTF-8"));
            signature = byteToHex(crypt.digest());
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return signature;
    }

    /**
     * 获得Sign签名
     *
     * @param params
     * @return
     */
    public static String getSign(Map<String, Object> params, String mchKey) {
        // 将参数中的所有键获取转换成字符数组
        String[] keys = (String[]) params.keySet().toArray(new String[params.size()]);
        // 进行排序
        Arrays.sort(keys);

        StringBuffer signBuffer = new StringBuffer();
        for (int i = 0; i < keys.length; i++) {
            String key = keys[i];
            Object val = params.get(key);
            // 没有值不拼接
            if (val == null || val.toString().length() == 0) {
                continue;
            }
            signBuffer.append(key + "=" + params.get(key) + "&");
        }
        signBuffer.append("key=" + mchKey);
        return MD5Util.encrypt(signBuffer.toString()).toUpperCase();
    }

    public static String getTimestamp() {
        return Long.toString(System.currentTimeMillis() / 1000);
    }

    public static String getNonceStr() {
        return UUID.randomUUID().toString();
    }

    /**
     * 获得请求xml
     *
     * @param params
     * @return
     */
    public static String getRequestXML(Map<String, Object> params, String sign) {
        // 将参数中的所有键获取转换成字符数组
        String[] keys = (String[]) params.keySet().toArray(new String[params.size()]);
        // 进行排序
        Arrays.sort(keys);

        StringBuffer requestBuffer = new StringBuffer();
        requestBuffer.append("<xml>");
        for (int i = 0; i < keys.length; i++) {
            String key = keys[i];
            requestBuffer.append("<" + key + ">" + params.get(key) + "</" + key + ">");
        }
        requestBuffer.append("<sign>" + sign + "</sign>");
        requestBuffer.append("</xml>");

        return requestBuffer.toString();
    }

    public String getPublicSignature(String appId, String secret, String noncestr, String timestamp, String url) {
        String accessToken = getPublicAccessToken(appId, secret);
        return getSignature(accessToken, noncestr, timestamp, url);
    }

    public String getPublicJsApiTicket(String appId, String secret) {
        String accessToken = getPublicAccessToken(appId, secret);
        String jsapiTicket = null;
        // 首先到缓存中获取，查看是否存在
        Cache jsApiTicketCache = CacheContext.getContext().getCache("JS_API_TICKET_PUBLIC_" + accessToken, 7000);
        if (jsApiTicketCache != null) {
            jsapiTicket = (String) jsApiTicketCache.get("jsapiTicket");
        }

        if (jsapiTicket != null) {
            return jsapiTicket;
        }

        // 通过get请求获取结果，并解析出其中的access_token
        DaoResult httpDaoResult = HttpUtil.get("https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=" + accessToken);
        // 如果发生错误，直接返回空即可
        if (httpDaoResult.getFlag() <= 0) {
            return jsapiTicket;
        }

        // 解析其中的JSON返回结果
        JSONObject json = JSONObject.parseObject(httpDaoResult.getMessage());

        // 获得这个结果
        jsapiTicket = json.getString("ticket");
        // 保存该标识到缓存，避免反复去获取
        jsApiTicketCache.put("jsapiTicket", jsapiTicket);
        return jsapiTicket;
    }

    private static String byteToHex(final byte[] hash) {
        return WxSignUtil.getString(hash);
    }
}
