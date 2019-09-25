package com.cffc.manage.action;


import com.haitsoft.framework.core.context.HaitContext;
import com.haitsoft.framework.core.servlet.IAction;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.bean.Response;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

/**
 * @author chenjialun
 * @description: TODO
 * @date 2019/6/1315:16
 */
public class UploadImgAction implements IAction {

    //定义允许上传的文件扩展名必须是图片
    private String allowedAuffix = "bmp,jpg,png,tif,gif,pcx,tga,exif,fpx,svg,psd,cdr,pcd,dxf,ufo,eps,ai,raw,wmf,webp,jpeg,hdri,flic,ico";

    @Override
    public void doAction(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        if (!ServletFileUpload.isMultipartContent(request)) {// 判断来的请求是否是文件上传请求
            resultJSON(-10300002, response);
            return;
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
            resultJSON(-10300003, response);
            return;
        }

        FileItemFactory factory = new DiskFileItemFactory();
        ServletFileUpload upload = new ServletFileUpload(factory);
        upload.setHeaderEncoding("UTF-8");
        List items = null;

        try {
            items = upload.parseRequest(request);
        } catch (FileUploadException e) {
            this.resultJSON(-10300004, HaitContext.getMessageByCode(-10300004, e.getMessage()), response);
            return;
        }

        // 解析上传的数据
        Iterator itr = items.iterator();
        if (!itr.hasNext()) {
            this.resultJSON(-10300004, HaitContext.getMessageByCode(-10300004, "not element"), response);
            return;
        }

        FileItem item = (FileItem) itr.next();
        String fileName = item.getName();
        if (item.isFormField()) {
            this.resultJSON(-10300004, HaitContext.getMessageByCode(-10300004, "not file data"), response);
            return;
        }

        // 生成全新的文件名称
        String fileExt = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        if (!Arrays.<String> asList(allowedAuffix.split(",")).contains(fileExt)) {
            this.resultJSON(-10300006, HaitContext.getMessageByCode(-10300006, this.allowedAuffix), response);
            return;
        }
        sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String uploadTime = sdf.format(new Date());
        String uploadFileName = "img_" + uploadTime + "." + fileExt;
        try {
            File uploadedFile = new File(savePath, uploadFileName);
            item.write(uploadedFile);
        } catch (Exception e) {
            this.resultJSON(-10300007, response);
            return;
        }

        String imgUrl = "/uploadImg/" + uploadDate + "/" + uploadFileName;
        String returnContext = "{\"img_url\" : [\""+ imgUrl + "\"]}";
        response.setContentType("application/json; charset=utf-8");
        response.getWriter().write(returnContext);
        response.flushBuffer();
    }

    protected void resultJSON(long flag, HttpServletResponse response) throws IOException {
        resultJSON(new DaoResult(flag, HaitContext.getMessageByCode(flag)), response);
    }

    protected void resultJSON(long flag, String message, HttpServletResponse response) throws IOException {
        resultJSON(new DaoResult(flag, message), response);
    }

    protected void resultJSON(DaoResult daoResult, HttpServletResponse response) throws IOException {
        Response haitResponse = new Response();
        haitResponse.getResults().add(daoResult);
        haitResponse.setFlag(daoResult.getFlag());
        haitResponse.setMessage(daoResult.getMessage());
        // 将结果使用HTML方式返回
        response.setContentType("text/html; charset=UTF-8");
        response.getWriter().write(haitResponse.asJSON());
        response.flushBuffer();
    }

    protected void print(HttpServletResponse httpResponse, Response haitResponse) throws IOException {
        httpResponse.setContentType("text/json; charset=UTF-8");
        httpResponse.getWriter().write(haitResponse.asJSON());
        httpResponse.flushBuffer();
    }
}
