// O'zbekiston vaqti (UTC+5, Asia/Tashkent)
const TZ = 'Asia/Tashkent';

// Sana: "15.03.2025"
export const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('uz-UZ', {
    timeZone: TZ,
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  });
};

// Sana + vaqt: "15.03.2025, 14:30"
export const fmtDateTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleString('uz-UZ', {
    timeZone: TZ,
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
};

// Faqat vaqt: "14:30"
export const fmtTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('uz-UZ', {
    timeZone: TZ,
    hour:   '2-digit',
    minute: '2-digit',
  });
};
