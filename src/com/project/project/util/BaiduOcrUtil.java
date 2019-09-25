package com.cffc.manage.util;

import com.baidu.aip.ocr.AipOcr;
import org.json.JSONObject;

import java.util.HashMap;

public class BaiduOcrUtil {
    //设置APPID/AK/SK
    public static final String APP_ID = "17127400";
    public static final String API_KEY = "5ipouxee8j5DYemQLPp2j5My";
    public static final String SECRET_KEY = "Ktcz3VQuMHqDbDGQljx4EqSNHdDhI7IB";

    // 初始化一个AipOcr
    static AipOcr aipOcrClient;

    static {
        aipOcrClient = new AipOcr(APP_ID, API_KEY, SECRET_KEY);
        // 可选：设置网络连接参数
        aipOcrClient.setConnectionTimeoutInMillis(2000);
        aipOcrClient.setSocketTimeoutInMillis(60000);
    }

    /**
     * 通用文字识别（高精度版）
     * @param imgPath 需要识别图片的路径
     * @return
     */
    public static JSONObject basicAccurateGeneral(String imgPath){
        JSONObject res = aipOcrClient.basicAccurateGeneral(imgPath, new HashMap<String, String>());
        return res;
    }

    /**
     * 通用文字识别（高精度版）
     * @param imageData 需要识别图片的byte数据
     * @return
     */
    public static JSONObject basicAccurateGeneral(byte[] imageData){
        JSONObject res = aipOcrClient.basicAccurateGeneral(imageData, new HashMap<String, String>());
        return res;
    }

    public static void main(String[] args) {
        // 调用接口
        String path = "D:\\OneDrive\\Documents\\川庆\\test4.png";
        JSONObject res = basicAccurateGeneral(path);
        System.out.println(res.toString(2));
    }
}
