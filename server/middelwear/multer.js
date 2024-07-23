const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => {
        // You can include file type checking here if you want to restrict to certain types
        const fileExt = path.extname(file.originalname);
        cb(null, `resume-${Date.now()}${fileExt}`);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;