// const normalizeProductImage = (img, folder = '') => {
//   if (!img) return null;

//   // already full URL
//   if (img.startsWith('http')) return img;

//   // remove ALL folder prefixes from DB value
//   const cleanImg = img
//     .replace(/^\/+/, '')
//     .replace(/^giftcards\//, '')
//     .replace(/^products\//, '')
//     .replace(/^services\//, '')

// const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

// return `${baseUrl}/uploads/${folder}/${cleanImg}`;
// };

const normalizeProductImage = (img, folder = '') => {
  if (!img) return null;

  // object support (multer / mongoose cases)
  if (typeof img === 'object' && img.filename) {
    img = img.filename;
  }

  // if still not string → safe exit
  if (typeof img !== 'string') return null;

  // already full URL
  if (img.startsWith('http')) return img;

  // clean path
  const cleanImg = img
    .replace(/^\/+/, '')
    .replace(/^uploads\//, '')
    .replace(/^giftcards\//, '')
    .replace(/^products\//, '')
    .replace(/^services\//, '');

  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

  return `${baseUrl}/uploads/${folder}/${cleanImg}`;
};

module.exports = { normalizeProductImage };