import { format, startOfMonth, endOfMonth } from 'date-fns';

export const getStartDate = () => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  if (currentDay < 16) {
    return format(new Date(currentYear, currentMonth, 1), 'yyyy-MM-dd');
  }
  return format(new Date(currentYear, currentMonth, 16), 'yyyy-MM-dd');
};

export const getInitialDateRange = () => {
  const today = new Date();
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