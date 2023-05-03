const mongoose = require("mongoose"),
	Schema = mongoose.Schema;

const studentSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		enrollment_number: {
			type: String,
			required: true,
			unique: true,
		},
		classrooms: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "classroomModel",
			},
		],
	},
	{ timestamps: true, versionKey: false, collection: "student" },
);

const studentModel = mongoose.model("student", studentSchema);

module.exports = studentModel;
