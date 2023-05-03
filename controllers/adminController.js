const adminModel = require("../models/adminModel");
const teacherModel = require("../models/teacherModel");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../middlewares/TokenManager");

const { createPassword, sendEmail } = require("../services");

module.exports = {
	addAdmin: async function (req, res, next) {
		let { name, email, password } = req.body;
		let admin = await new adminModel({
			name,
			email,
			password,
		}).save();

		if (admin) {
			res.status(200).json({
				message: "Admin added successfully",
				data: admin,
			});
		}
	},

	adminLogin: async function (req, res, next) {
		let { email, password } = req.body;

		if (!email && !password) {
			return res.status(400).json({
				message: "Email and password are required",
			});
		}

		// check if user in database and if it is generate jwt token and send it to response, otherwise send error message: "Invalid email or password"
		let admin = await adminModel.findOne({ email, password });

		if (admin) {
			let token = generateToken({
				admin_id: admin._id,
				email: admin.email,
			});

			res.status(200).json({
				message: "Admin logged in successfully",
				data: {
					admin,
					token,
				},
			});
		} else {
			res.status(400).json({
				message: "Invalid email or password",
			});
		}
	},

	addTeacher: async function (req, res, next) {
		let { name, email, subjects } = req.body;

		let password = createPassword(8);

		let teacher = await teacherModel.findOneAndDelete({ email });

		if (teacher) {
			return res.status(400).json({
				message: "Teacher already exists",
			});
		}

		teacher = await new teacherModel({
			name,
			email,
			password,
			subjects,
		}).save();

		if (teacher) {
			console.log("password: ", password);
			await sendEmail(
				email,
				`Welcome to Scholastics ${name}, your email is ${email} and password is ${password}`,
			);

			res.status(200).json({
				message: "Teacher added successfully",
				data: teacher,
			});
		}
	},
};
