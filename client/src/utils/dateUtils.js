import { format, parseISO, startOfMonth, endOfMonth, parseISO as parseISODate } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, format as formatTZ } from 'date-fns-tz';

// 温哥华时区
const VANCOUVER_TIMEZONE = 'America/Vancouver';

// 将日期转换为温哥华时区
export const toVancouverTime = (date) => {
  return utcToZonedTime(new Date(date), VANCOUVER_TIMEZONE);
};

// 将温哥华时间转换为UTC
export const fromVancouverTime = (date) => {
  return zonedTimeToUtc(new Date(date), VANCOUVER_TIMEZONE);
};

// 格式化日期，显示温哥华时区
export const formatVancouverDate = (date, formatStr = 'yyyy-MM-dd HH:mm:ss') => {
  if (!date) return '';
  const vancouverDate = toVancouverTime(date);
  return formatTZ(vancouverDate, formatStr, { timeZone: VANCOUVER_TIMEZONE });
};

// 解析ISO日期字符串为日期对象，考虑温哥华时区
export const parseVancouverDate = (dateString) => {
  if (!dateString) return null;
  try {
    return toVancouverTime(parseISODate(dateString));
  } catch (e) {
    console.error('Invalid date format:', dateString);
    return null;
  }
};

export const getStartDate = () => {
  const today = utcToZonedTime(new Date(), VANCOUVER_TIMEZONE);
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  if (currentDay < 16) {
    return format(new Date(currentYear, currentMonth, 1), 'yyyy-MM-dd');
  }
  return format(new Date(currentYear, currentMonth, 16), 'yyyy-MM-dd');
};

export const getInitialDateRange = () => {
  const today = utcToZonedTime(new Date(), VANCOUVER_TIMEZONE);
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let startDate, endDate;

  if (currentDay < 16) {
    // First half of the month (1-15)
    startDate = new Date(currentYear, currentMonth, 1);
    endDate = new Date(currentYear, currentMonth, 15);
  } else {
    // Second half of the month (16-end)
    startDate = new Date(currentYear, currentMonth, 16);
    endDate = endOfMonth(new Date(currentYear, currentMonth));
  }

  return {
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd')
  };
};

// 格式化时间差为小时和分钟
export const formatDuration = (durationInHours) => {
  if (!durationInHours || isNaN(durationInHours)) return '0h 0m';

  const hours = Math.floor(durationInHours);
  const minutes = Math.round((durationInHours - hours) * 60);

  return `${hours}h ${minutes}m`;
};

// 安全地格式化日期时间，处理无效日期
export const formatDateTime = (dateTime, formatStr = 'yyyy-MM-dd HH:mm') => {
  if (!dateTime) return 'N/A';

  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return formatVancouverDate(date, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};