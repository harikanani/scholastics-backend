const multer = require("multer");

const storage = multer.diskStorage({
	destination: `public/${process.env.FILE_DESTINATION}`,
	filename: (req, file, cb) => {
		console.log("multer : files :: ", file);
		let filename = String(new Date().getTime()) + "_" + file.originalname;
		req.filename = filename;
		cb(null, filename);
	},
});

const upload = multer({
	storage: storage,
});

module.exports = upload;
