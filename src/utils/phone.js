const digitsOnly = (v) => v.replace(/\D/g, '');

export const maskPhone = (value) => {
  let d = digitsOnly(value);
  if (d.startsWith('998')) d = d;
  else if (d.startsWith('8')) d = '998' + d.slice(1);
  else if (d === '') d = '';
  else d = '998' + d;

  d = d.slice(0, 12);

  let result = '+998';
  if (d.length > 3) result += ' ' + d.slice(3, 5);
  if (d.length > 5) result += ' ' + d.slice(5, 8);
  if (d.length > 8) result += ' ' + d.slice(8, 10);
  if (d.length > 10) result += ' ' + d.slice(10, 12);

  return result;
};

export const isValidPhone = (value) => {
  const digits = digitsOnly(value);
  return digits.length === 12 && digits.startsWith('998');
};

export const handlePhoneChange = (e, setter) => {
  setter(maskPhone(e.target.value));
};