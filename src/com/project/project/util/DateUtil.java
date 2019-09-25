package com.cffc.manage.util;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/**
 * 日期、时间相关操作工具类
 * 
 * @author chenjialun
 * @date 2018年1月26日 下午5:18:37
 * @copyright(c) yunlaila.com.cn
 */
public class DateUtil {

	/**
	 * 获取一段时间内的所有日期，返回String数组，格式 MM.dd
	 * 
	 * @param startTime
	 * @param endTime
	 * @return
	 * @throws ParseException
	 */
	public static String[] getDayList(String startTime, String endTime) throws ParseException {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
		Date dBegin = format.parse(startTime);
		Date dEnd = format.parse(endTime);
		List<Date> lDate = new ArrayList<Date>();
		lDate.add(dBegin);
		Calendar calBegin = Calendar.getInstance();
		// 使用给定的 Date 设置此 Calendar 的时间
		calBegin.setTime(dBegin);
		Calendar calEnd = Calendar.getInstance();
		// 使用给定的 Date 设置此 Calendar 的时间
		calEnd.setTime(dEnd);
		// 测试此日期是否在指定日期之后
		while (dEnd.after(calBegin.getTime())) {
			// 根据日历的规则，为给定的日历字段添加或减去指定的时间量
			calBegin.add(Calendar.DAY_OF_MONTH, 1);
			lDate.add(calBegin.getTime());
		}
		String[] dayArray = new String[lDate.size()];
		for (int i = 0; i < lDate.size(); i++) {
			Date curDate = lDate.get(i);
			dayArray[i] = new SimpleDateFormat("MM.dd").format(curDate);
		}
		return dayArray;
	}
	
	/**
	 * 获取一段时间内的所有日期，返回String数组，格式 yyyy-MM-dd
	 * 
	 * @param startTime
	 * @param endTime
	 * @return
	 * @throws ParseException
	 */
	public static String[] getDateList(String startTime, String endTime) throws ParseException {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
		Date dBegin = format.parse(startTime);
		Date dEnd = format.parse(endTime);
		List<Date> lDate = new ArrayList<Date>();
		lDate.add(dBegin);
		Calendar calBegin = Calendar.getInstance();
		// 使用给定的 Date 设置此 Calendar 的时间
		calBegin.setTime(dBegin);
		Calendar calEnd = Calendar.getInstance();
		// 使用给定的 Date 设置此 Calendar 的时间
		calEnd.setTime(dEnd);
		// 测试此日期是否在指定日期之后
		while (dEnd.after(calBegin.getTime())) {
			// 根据日历的规则，为给定的日历字段添加或减去指定的时间量
			calBegin.add(Calendar.DAY_OF_MONTH, 1);
			lDate.add(calBegin.getTime());
		}
		String[] dayArray = new String[lDate.size()];
		for (int i = 0; i < lDate.size(); i++) {
			Date curDate = lDate.get(i);
			dayArray[i] = format.format(curDate);
		}
		return dayArray;
	}
	
	/**
	 * 改变当前日期
	 * 
	 * @param date 要改变的日期
	 * @param day 要改变的天数，正数为增加，负数为减少
	 * @return yyyy-MM-dd
	 * @throws ParseException 
	 */
	public static String getAddDate(String date, int day) throws ParseException {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
		Calendar c = Calendar.getInstance();
		c.setTime(new Date(format.parse(date).getTime()));
		c.add(Calendar.DATE, day);
		Date d = c.getTime();
		return format.format(d);
	}
	
	/**
	 * 获取两个日期的相差天数
	 * 
	 * @param startDate 
	 * @param endDate
	 * @return day
	 * @throws ParseException
	 */
	public static long getDateSpan(String startDate, String endDate) throws ParseException {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
		long startDay = format.parse(startDate).getTime();
		long endDay = format.parse(endDate).getTime();
		long day = (endDay - startDay) / (1000 * 60 * 60 * 24);
		return day;
	}

	public static long getMinSpan(String startDate, String endDate) throws ParseException {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		long startDay = format.parse(startDate).getTime();
		long endDay = format.parse(endDate).getTime();
		long day = (endDay - startDay) / (1000 * 60);
		return day;
	}
	/*/*
	  * @param startTime 开始的时间
	 * @param days   几天之后的天数
	 * @return java.lang.String
	 * @exception
	 * @author Sunjie
	 * @date 2019/8/30 0030 15:15
	 */
	public static String getAfterDate(String startTime,String days){
		DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
		LocalDate localDateTime = LocalDate.parse(startTime, dateTimeFormatter);
		int day = Integer.parseInt(days);
		localDateTime=localDateTime.plusDays(day);
		return localDateTime.toString();
	}

}
