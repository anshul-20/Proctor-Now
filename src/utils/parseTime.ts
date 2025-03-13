export const parseTime = (timeInSeconds: number): string => {
  let h: number | string = Math.floor(timeInSeconds / 3600);
  let m: number | string = Math.floor((timeInSeconds % 3600) / 60);
  let s: number | string = Math.floor((timeInSeconds % 3600) % 60);

  if (h < 10) {
    h = `0${h}`;
  }
  if (m < 10) {
    m = `0${m}`;
  }
  if (s < 10) {
    s = `0${s}`;
  }

  return `${h}:${m}:${s}`;
};
