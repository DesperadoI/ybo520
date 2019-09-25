package com.cffc.manage.util;

import com.cloopen.rest.sdk.utils.encoder.BASE64Decoder;
import com.cloopen.rest.sdk.utils.encoder.BASE64Encoder;
import com.haitsoft.framework.core.context.HaitContext;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

public class Base64ImgSaveUtil implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map context) throws Exception {
        String base64Img = StringUtil.getString(params, "base64_img");

        if(base64Img == null || base64Img.length() == 0){
            return new DaoResult(-1, "保存失败");
        }

        // 检查目录
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        String uploadDate = sdf.format(new Date());

        String savePath = HaitContext.BASE_PATH + "uploadImg" + File.separator + uploadDate;
        File uploadDir = new File(savePath);
        if (!uploadDir.isDirectory()) {
            // 上传目录不存在则创建
            uploadDir.mkdirs();
        }

        // 检查目录写权限
        if (!uploadDir.canWrite()) {
            return new DaoResult(-1, "保存失败");
        }

        //生成文件名
        sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String uploadTime = sdf.format(new Date());
        String uploadFileName = "img_" + uploadTime + ".jpg";
        savePath += File.separator + uploadFileName;

        //保存Base64图片到服务器
        GenerateImage(base64Img, savePath);

        //返回图片链接
        String returnUrl = "/uploadImg/" + uploadDate + "/" + uploadFileName;
        DaoResult daoResult = new DaoResult(1, "保存成功");
        List<Map> resultList = new ArrayList<Map>();
        Map resultMap = new HashMap();
        resultMap.put("img_url", returnUrl);
        resultList.add(resultMap);
        daoResult.setItems(resultList);

        return daoResult;
    }

    @Override
    public void doRollback(Map context) {

    }

    /**
     * 将图片文件转化为字节数组字符串，并对其进行Base64编码处理
     * @param imgFilePath
     * @return
     */
    public static String GetImageStr(String imgFilePath) {
        byte[] data = null;

        // 读取图片字节数组
        try {
            InputStream in = new FileInputStream(imgFilePath);
            data = new byte[in.available()];
            in.read(data);
            in.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 对字节数组Base64编码
        BASE64Encoder encoder = new BASE64Encoder();
        return encoder.encode(data);// 返回Base64编码过的字节数组字符串
    }

    /**
     * 对字节数组字符串进行Base64解码并生成图片
     * @param imgStr
     * @param imgFilePath
     * @return
     */
    public static boolean GenerateImage(String imgStr, String imgFilePath) {
        if (imgStr == null) // 图像数据为空
            return false;
        BASE64Decoder decoder = new BASE64Decoder();
        try {
            // Base64解码
            byte[] bytes = decoder.decodeBuffer(imgStr);
            for (int i = 0; i < bytes.length; ++i) {
                if (bytes[i] < 0) {// 调整异常数据
                    bytes[i] += 256;
                }
            }
            // 生成jpeg图片
            OutputStream out = new FileOutputStream(imgFilePath);
            out.write(bytes);
            out.flush();
            out.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
