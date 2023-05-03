const mongoose = require("mongoose");
const teacherModel = require("../models/teacherModel");
const studentModel = require("../models/studentModel");
module.exports = {
	isTeacher: async (req, res, next) => {
		if (req.user && req.user.teacher_id) {
			const teacher = await teacherModel.findOne({
				_id: new mongoose.Types.ObjectId(req.user.teacher_id),
			});

			if (teacher) {
				next();
			}
		} else {
			return res.status(401).json({
				message: "Unauthorized!!",
			});
		}
	},
	isStudent: async (req, res, next) => {
		if (req.user && req.user.student_id) {
			const student = await studentModel.findOne({
				_id: new mongoose.Types.ObjectId(req.user.student_id),
			});

			if (student) {
				next();
			}
		} else {
			return res.status(401).json({
				message: "Unauthorized!!",
			});
		}
	},
};
