const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper to ensure folder exists
const ensureFolderExists = folderPath => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Factory function to create multer upload for different folders
const createUpload = (folderName) => {
  const uploadPath = path.join(__dirname, '..', 'uploads', folderName);
  ensureFolderExists(uploadPath);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, filename);
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only jpg, png, gif allowed.'));
    }
  };

  return multer({ storage, fileFilter });
};

module.exports = createUpload;