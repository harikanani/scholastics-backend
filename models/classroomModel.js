const mongoose = require("mongoose"),
	Schema = mongoose.Schema;

const ClassRoomSchema = new Schema(
	{
		subject_name: {
			type: String,
			required: true,
		},
		subject_code: {
			type: String,
			required: true,
			unique: true,
		},
		teacherId: {
			type: Schema.Types.ObjectId,
			ref: "teacherModel",
			required: false,
		},
		students: [
			{
				type: Schema.Types.ObjectId,
				ref: "studentModel",
			},
		],
		assignments: [
			{
				type: Schema.Types.ObjectId,
				ref: "AssignmentModel",
			},
		],
		feed: [
			{
				user: {
					type: String,
					required: true,
				},
				message: {
					type: String,
					required: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
				fileUrl: {
					type: String,
					required: false,
				},
			},
		],
	},
	{ timestamps: true, versionKey: false, collection: "classroom" },
);

const ClassroomModel = mongoose.model("classroomModel", ClassRoomSchema);

module.exports = ClassroomModel;
