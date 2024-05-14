import * as moment from 'moment-jalali';

export const factorNumberGenerator = () => {
  return (
    moment().format('YYYYMMHHmmssSSS') + String(process.hrtime()[1]).padStart(9)
  );
};
