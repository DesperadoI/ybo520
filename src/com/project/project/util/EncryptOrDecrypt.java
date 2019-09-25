package com.cffc.manage.util;

import com.haitsoft.framework.core.util.EnDeUtil;

public class EncryptOrDecrypt {
    public static void main(String [] args){
        EnDeUtil databaseDe = new EnDeUtil("yunlaila_database");
        System.out.println("user:" + databaseDe.encrypt("root"));
        System.out.println("pass:" + databaseDe.encrypt("dfgrh522asf6Ht")); // 加密
//        System.out.println("pass:" + databaseDe.decrypt("root")); // 解密
    }
}