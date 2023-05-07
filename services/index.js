const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);

const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = "scholastic.abhigoyani.me";

const client = mailgun.client({ username: "api", key: API_KEY });

module.exports = {
	createPassword: function (length = 8) {
		// Declare all characters
		let chars =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		// Pick characers randomly
		let password = "";
		for (let i = 0; i <= length; i++) {
			let index = Math.floor(Math.random() * chars.length);
			password += chars.substring(index, index + 1);
		}

		// Return password
		return password;
	},

	sendEmail: function (to, text) {
		const messageData = {
			from: "Excited User <credentials@scholastic.abhigoyani.me>",
			to: to,
			subject: "Singup to Scholastics",
			text: text,
		};

		client.messages
			.create(DOMAIN, messageData)
			.then((res) => {
				console.log(res);
			})
			.catch((err) => {
				console.error(err);
			});
	},

	uploadAssignmentFile: async (req, res) => {
		try {
			if (!req.file) {
				return res.status(400).json({
					message: "No file selected!",
				});
			}

			return res.status(200).json({
				full_path:
					process.env.BASE_URL +
					"/" +
					process.env.FILE_DESTINATION +
					req.filename,
				short_path: process.env.FILE_DESTINATION + req.filename,
			});
		} catch (error) {
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error.message,
			});
		}
	},
};
