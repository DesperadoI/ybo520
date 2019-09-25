package com.cffc.manage.util;

import com.haitsoft.framework.cache.bean.Cache;
import com.haitsoft.framework.cache.context.CacheContext;
import com.haitsoft.framework.core.util.MD5Util;
import com.haitsoft.framework.data.bean.DaoResult;

import java.util.Map;

/**
 * @author chenjialun
 * @description: TODO
 * @date 2019/6/1313:09
 */
public class SystemDictUtil {

    public String getCacheKey(String funcId, Map params) {
        // 拼接key
        StringBuffer cacheKey = new StringBuffer();
        for (Object mapKey : params.keySet()) {
            if ("funcId".equals(mapKey)) {
                continue;
            }
            if (mapKey.toString().startsWith("session.")) {
                continue;
            }
            Object mapVal = params.get(mapKey);
            cacheKey.append(mapKey + "" + mapVal);
        }
        // 这里可能存在字符串过长的问题，进行MD5加密缩短
        return funcId + ":" + MD5Util.encrypt(cacheKey.toString());
    }

    public void setDaoResultToCache(String cacheKey, DaoResult daoResult, int cacheTimeout) {
        Cache cache = CacheContext.getContext().getCache(cacheKey, cacheTimeout);
        // 如果结果为空，那么是没有开启缓存服务，则不做任何操作
        if (cache == null) {
            return;
        }
        cache.put("daoResult", daoResult);
    }

    public DaoResult getDaoResultByCache(String cacheKey, int cacheTimeout) {
        Cache cache = CacheContext.getContext().getCache(cacheKey, cacheTimeout);
        // 如果结果为空，那么是没有开启缓存服务，则不做任何操作
        if (cache == null) {
            return null;
        }
        return (DaoResult) cache.get("daoResult");
    }
}
