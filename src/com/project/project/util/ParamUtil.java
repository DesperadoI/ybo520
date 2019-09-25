/**
 * ==========================================
 * @(#)ParamUtil.java	2003/07/12
 * @author              playp
 * @version             1.0
 * ==========================================
 */
 
package com.cffc.manage.util;

import javax.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;


public class ParamUtil {
	 
	
	public static String getGBKStr(HttpServletRequest request, String s) {
        String str = "";
		try {
			 String temp = request.getParameter(s);
			 if (temp == null)
			     return str;
			 else
			     str = ISO2GBK(temp.trim());
		} catch (Exception e){}
	    return str;
    }
	
	public static String getString(HttpServletRequest request, String s) {
		String str = "";
		try {
			String temp = request.getParameter(s).trim();			
			if (temp == null)
				return str;
			else
				str = temp;
		} catch (Exception e){}
		return str;
	}

	
	
	public static String getStringGBK(HttpServletRequest request, String s) {
        String str = "";
		try {
			 String temp = ISO2GBK(request.getParameter(s).trim());
			 if (temp == null)
			     return str;
			 else
			     str = temp;
		} catch (Exception e){}
	    return str;
    }


	
	public static String getString2(HttpServletRequest request, String s) {
        String str = " ";
		try {
			 String temp = request.getParameter(s);
			 if (temp == null)
			     return str;
			 else
			     str = temp;
		} catch (Exception e){}
	    return str;
    }
	
	public static int getInt(HttpServletRequest request, String s) {
		int i = 0;
		try {
			 String temp = getString(request,s);
			 if (temp.equals(""))
				 return i;
			 else
				 i = Integer.parseInt(temp);
		} catch (NumberFormatException e) {}
		return i;
	}
	
	public static long getLong(HttpServletRequest request, String s) {
		long l = 0;
		try {
			 String temp = getString(request,s);
			 if (temp.equals(""))
				 return l;
			 else
				 l = Long.parseLong(temp);
		} catch (NumberFormatException e) {}
		return l;
	}

	public static float getFloat(HttpServletRequest request, String s) {
		float f = 0.0f;
		try {
			 String temp = getString(request,s);
			 if (temp.equals(""))
				 return f;
			 else
				 f = Float.parseFloat(temp);
		} catch (NumberFormatException e) {}
		return f;
	}
	
	public static double getDouble(HttpServletRequest request, String s) {
		double d = 0;
		try {
			 String temp = getString(request,s);
			 if (temp.equals(""))
				 return d;
			 else
				 d = Double.parseDouble(temp);
		} catch (NumberFormatException e) {}
		return d;
	}
	public static String[] getValues(HttpServletRequest request, String s) {
	    return request.getParameterValues(s);
	}
	
	public static String ISO2GBK(String s) {
	    if (s == null){
		    s = "";
		} else {
		    try {
			    s = new String(s.getBytes("ISO-8859-1"),"GBK");
			} catch(UnsupportedEncodingException e) {
			    System.out.println("�޷�ת��ISO-8859-1��GBK�ַ�");
			}
		}
		return s;
    }
	
}