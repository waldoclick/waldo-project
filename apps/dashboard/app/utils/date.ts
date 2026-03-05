export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "--";

  const date = new Date(dateString);
  const now = new Date();

  // If date is invalid, return --
  if (Number.isNaN(date.getTime())) return "--";

  const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("es-CL", { numeric: "always" });

  // Future dates (shouldn't happen often in this context, but handle gracefully)
  if (diffInSeconds < 0) {
    return formatDateShort(dateString); // Fallback to absolute for future
  }

  if (diffInSeconds < 60) {
    return rtf.format(-Math.round(diffInSeconds), "second");
  }

  const diffInMinutes = diffInSeconds / 60;
  if (diffInMinutes < 60) {
    return rtf.format(-Math.round(diffInMinutes), "minute");
  }

  const diffInHours = diffInMinutes / 60;
  if (diffInHours < 24) {
    return rtf.format(-Math.round(diffInHours), "hour");
  }

  const diffInDays = diffInHours / 24;
  if (diffInDays < 30) {
    return rtf.format(-Math.round(diffInDays), "day");
  }

  const diffInMonths = diffInDays / 30;
  if (diffInMonths < 12) {
    return rtf.format(-Math.round(diffInMonths), "month");
  }

  const diffInYears = diffInDays / 365;
  return rtf.format(-Math.round(diffInYears), "year");
};

export const formatDateShort = (dateString: string | undefined): string => {
  if (!dateString) return "--";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};
