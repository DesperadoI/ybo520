package com.cffc.manage.util;

import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.dao.function.IFunction;
import org.apache.http.HttpResponse;
import org.apache.http.util.EntityUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AliyunOcrUtil implements IFunction {

    @Override
    public DaoResult doFunction(Map params, Map context) throws Exception {
        String url = StringUtil.getString(params, "url");
//        url = "http://des.dev.chinayunsoft.com/cffc/uploadImg/2019-08-29/test1.png";
        if(url == null || url.length() == 0){
            return new DaoResult(-1, "图片链接不能为空！");
        }

        String host = "https://ocrapi-advanced.taobao.com";
        String path = "/ocrservice/advanced";
        String method = "POST";
        String appcode = "aaf65ab19e3e458ea2599a60c77f56da";
        Map<String, String> headers = new HashMap<String, String>();
        //最后在header中的格式(中间是英文空格)为Authorization:APPCODE 83359fd73fe94948385f570e3c139105
        headers.put("Authorization", "APPCODE " + appcode);
        //根据API的要求，定义相对应的Content-Type
        headers.put("Content-Type", "application/json; charset=UTF-8");
        Map<String, String> querys = new HashMap<String, String>();
        String bodys = "{\"img\":\"\",\"url\":\""+url+"\",\"prob\":false,\"charInfo\":false,\"rotate\":false,\"table\":false}";

        try {
            /**
             * 重要提示如下:
             * HttpUtils请从
             * https://github.com/aliyun/api-gateway-demo-sign-java/blob/master/src/main/java/com/aliyun/api/gateway/demo/util/HttpUtils.java
             * 下载
             *
             * 相应的依赖请参照
             * https://github.com/aliyun/api-gateway-demo-sign-java/blob/master/pom.xml
             */
            HttpResponse response = HttpUtils.doPost(host, path, method, headers, querys, bodys);
            System.out.println(response.toString());
            String entity = EntityUtils.toString(response.getEntity());
            //获取response的body
            System.out.println(entity);
            if(entity.indexOf("error_code") >= 0){
                return new DaoResult(-1, "识别失败，请重试！");
            }

            DaoResult daoResult = new DaoResult(1, "识别成功");
            List<Map> resultList = new ArrayList<Map>();
            Map resultMap = new HashMap();
            resultMap.put("entity", entity);
            resultList.add(resultMap);
            daoResult.setItems(resultList);
            return daoResult;

        } catch (Exception e) {
            e.printStackTrace();
            return new DaoResult(-1, "识别失败，请重试！");
        }
    }

    @Override
    public void doRollback(Map context) {

    }
}
