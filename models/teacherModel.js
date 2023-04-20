const mongoose = require("mongoose"),
	Schema = mongoose.Schema;

const teacherSchema = new Schema(
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
		subjects: {
			type: Array,
			required: false,
		},
	},
	{ timestamps: true, versionKey: false, collection: "teacher" },
);

const teacherModel = mongoose.model("teacher", teacherSchema);

module.exports = teacherModel;
