const normalizeProductImage = (img, folder = '') => {
  if (!img) return null;

  // already full URL
  if (img.startsWith('http')) return img;

  // remove ALL folder prefixes from DB value
  const cleanImg = img
    .replace(/^\/+/, '')
    .replace(/^giftcards\//, '')
    .replace(/^products\//, '');

  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

  return `${baseUrl}/uploads/${folder}/${cleanImg}`;
};

module.exports = { normalizeProductImage };