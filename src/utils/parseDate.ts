export const parseDate = (date: string): string => {
  const currentDate = new Date(date);

  //   return "tw";
  return currentDate.toLocaleDateString(undefined, {
    day: "2-digit",
    year: "numeric",
    month: "long",
  });
};
