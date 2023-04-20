const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);

const API_KEY = "faa9c2f8b6bc238ffaeb5ab554fd9989-69210cfc-b389e326";
const DOMAIN = "onelock.tel";

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
			from: "Excited User <me@onelock.tel>",
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
};
