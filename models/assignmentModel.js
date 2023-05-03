const mongoose = require("mongoose"),
	Schema = mongoose.Schema;

const AssignmentSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		classrrom_id: {
			type: Schema.Types.ObjectId,
			ref: "classroomModel",
			required: true,
		},
		dueDate: {
			type: Date,
			required: true,
		},
		fileUrl: {
			type: String,
			required: false,
		},
		marks: {
			type: Number,
			required: true,
		},
		submissions: [
			{
				studentId: {
					type: Schema.Types.ObjectId,
					ref: "studentModel",
					required: true,
				},
				submissionDate: {
					type: Date,
					required: true,
				},
				fileUrl: {
					type: String,
					required: true,
				},
				feedback: String,
				marksObtained: Number,
			},
		],
	},
	{ collection: "assignments", versionKey: false, timestamps: true },
);

const AssignmentModel = mongoose.model("Assignments", AssignmentSchema);

module.exports = AssignmentModel;
