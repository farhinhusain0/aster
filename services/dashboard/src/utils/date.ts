import { format } from "date-fns";

export const utcToLocal = (utcDate: string | Date) => {
  const date = new Date(utcDate);
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return localDate;
};

interface FormatDateParams {
  inputDate: string | Date;
}

export const formatDate = ({ inputDate }: FormatDateParams) => {
  const localDate = utcToLocal(new Date(inputDate));
  return format(localDate, "EEE, MMM dd, yyyy, HH:mm:ss");
};
