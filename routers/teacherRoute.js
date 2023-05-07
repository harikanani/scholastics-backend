const express = require("express");
const teacherController = require("../controllers/teacherController");
const TokenManager = require("../middlewares/TokenManager");
const verify = require("../middlewares/verify");
const upload = require("../middlewares/upload");
const services = require("../services");

const teacherRouter = express.Router();

teacherRouter.post("/login", teacherController.teacherLogin);

teacherRouter.post(
	"/video-call",
	TokenManager.verifyToken,
	verify.isTeacher,
	teacherController.createVideoCall,
);

teacherRouter.post(
	"/addStudent",
	TokenManager.verifyToken,
	verify.isTeacher,
	teacherController.addStudent,
);

// create classroom
teacherRouter.post(
	"/createClassroom",
	TokenManager.verifyToken,
	verify.isTeacher,
	teacherController.createClassroom,
);

// upload Assignment File
teacherRouter.post(
	"/assignment/upload",
	TokenManager.verifyToken,
	verify.isTeacher,
	upload.single("assignment"),
	services.uploadAssignmentFile,
);

// create Assignments
teacherRouter.post(
	"/createAssignment",
	TokenManager.verifyToken,
	verify.isTeacher,
	teacherController.createAssignment,
);

// Grade Assignment
teacherRouter.post(
	"/gradeAssignment",
	TokenManager.verifyToken,
	verify.isTeacher,
	teacherController.gradeAndFeedbackAssignment,
);

// Teacher Dashboard
teacherRouter.post(
	"/dashboard",
	TokenManager.verifyToken,
	verify.isTeacher,
	teacherController.getTeacherDashboard,
);

// Teacher Post in Feed Section
teacherRouter.post(
	"/post",
	TokenManager.verifyToken,
	verify.isTeacher,
	teacherController.postFeed,
);

// retrive all post from feed section
teacherRouter.post(
	"/feed",
	TokenManager.verifyToken,
	verify.isTeacher,
	teacherController.getFeed,
);

module.exports = teacherRouter;
