const studentModel = require("../models/studentModel");
const teacherModel = require("../models/teacherModel");
const { createPassword } = require("../services");
const jwt = require("jsonwebtoken");

module.exports = {
	teacherLogin: async function (req, res) {
		try {
			let { email, password } = req.body;

			if (!email && !password) {
				return res.status(400).json({
					message: "Email and password are required",
				});
			}

			// check if user in database and if it is generate jwt token and send it to response, otherwise send error message: "Invalid email or password"
			let teacher = await teacherModel.findOne({ email, password });

			if (teacher) {
				let token = jwt.sign(
					{ teacher_id: teacher._id, email: admin.email },
					"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890",
					{
						expiresIn: "1h",
					},
				);
				res.status(200).json({
					message: "Teacher logged in successfully",
					data: {
						teacher,
						token,
					},
				});
			} else {
				res.status(400).json({
					message: "Invalid email or password",
				});
			}
		} catch (error) {
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error,
			});
		}
	},
	addStudent: async function (req, res) {
		try {
			const { name, email, enrollmentNo } = req.body;
			let password = createPassword(8);
			const student = await studentModel({
				name,
				email,
				password,
				enrollment_number: enrollmentNo,
			}).save();
			return res.status(200).json({
				message: "Student added successfully",
				student: student,
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({
				message: "Internal Server Error",
				error: error,
			});
		}
	},

	createClassroom: async (req, res) => {
		try {
			// let { subject, }
		} catch (error) {
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error,
			});
		}
	},
};
