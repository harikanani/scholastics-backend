const express = require("express");
const studentController = require("../controllers/studentController");
const TokenManager = require("../middlewares/TokenManager");
const verify = require("../middlewares/verify");
const services = require("../services");
const upload = require("../middlewares/upload");

const studentRouter = express.Router();

// studentRouter.post("/login", teacherController.teacherLogin);

studentRouter.post("/login", studentController.studentLogin);

studentRouter.post(
	"/joinClassroom/:id",
	TokenManager.verifyToken,
	verify.isStudent,
	studentController.joinClassroom,
);

studentRouter.post(
	"/assignment/upload",
	TokenManager.verifyToken,
	verify.isStudent,
	upload.single("assignment"),
	services.uploadAssignmentFile,
);

studentRouter.post(
	"/assignment/submit",
	TokenManager.verifyToken,
	verify.isStudent,
	studentController.submitAssignment,
);

studentRouter.post(
	"/classroom/:id",
	TokenManager.verifyToken,
	verify.isStudent,
	studentController.getClassroomDetails,
);

studentRouter.post(
	"/dashboard",
	TokenManager.verifyToken,
	verify.isStudent,
	studentController.getStudentDashboard,
);

studentRouter.post(
	"/profile",
	TokenManager.verifyToken,
	verify.isStudent,
	studentController.getStudentProfile,
);
module.exports = studentRouter;
