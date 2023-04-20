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
		subjects: {
			type: Array,
			// ! mark required: true
			required: false,
		},
	},
	{ timestamps: true, versionKey: false, collection: "student" },
);

const studentModel = mongoose.model("student", studentSchema);

module.exports = studentModel;
