export const parseDateAndTime = (date: string): string => {
  const currentDate = new Date(date);

  //   return "tw";
  return currentDate.toLocaleDateString(undefined, {
    day: "2-digit",
    year: "numeric",
    month: "long",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
  });
};
