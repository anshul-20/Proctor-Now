export const getExpiryDate = () => {
  let expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  return expiryDate;
};
