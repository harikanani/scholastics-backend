const mongoose = require("mongoose"),
	Schema = mongoose.Schema;

const adminSchema = new Schema(
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
	},
	{ timestamps: true, versionKey: false, collection: "admin" },
);

const adminModel = mongoose.model("admin", adminSchema);

module.exports = adminModel;
