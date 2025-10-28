import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormatedTimeDateJordan(dateInput: Date | string) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  let hours = date.getUTCHours() + 3;
  const minutes = date.getUTCMinutes();

  let period = "AM";
  if (hours >= 12) period = "PM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  const time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )} ${period}`;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  return { time, date: formattedDate };
}
