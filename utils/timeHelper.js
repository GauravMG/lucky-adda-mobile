import dayjs from 'dayjs';

export const formatTime12Hour = (timeString) => {
  if (!timeString) return '';

  const [hour, minute] = timeString.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12; // Convert 0 or 12 to 12

  return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

export const formatDateTime12HourWithoutnewline = (dateString: string) => {
  if (!dateString) return '';

  const date = dayjs(dateString);
  return date.format('MMMM D, YYYY h:mm A'); // Example: February 21, 2025 3:45 PM
};

export const formatDateTime12HourWithoutnewlineShortMonth = (dateString: string) => {
  if (!dateString) return '';

  const date = dayjs(dateString);
  return date.format('MMM D, YYYY h:mm A'); // Example: February 21, 2025 3:45 PM
};

export const formatDateTime12Hour = (dateString: string) => {
  if (!dateString) return '';

  const date = dayjs(dateString);
  return date.format('MMMM D, YYYY\nh:mm A'); // Example: February 21, 2025 3:45 PM
};

export const formatDateOnly = (dateString: string) => {
  if (!dateString) return '';

  const date = dayjs(dateString);
  return date.format('YYYY-MM-DD');
};
