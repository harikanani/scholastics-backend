const mongoose = require("mongoose");
const teacherModel = require("../models/teacherModel");
module.exports = {
	isTeacher: async (req, res) => {
		if (req.user && req.user.teacher_id) {
			const teacher = await teacherModel.findOne({
				_id: mongoose.Types.ObjectId(req.user.teacher_id),
			});

			if (teacher) {
				next();
			}
		}
		return res.status(401).json({
			message: "Unauthorized!!",
		});
	},
};
