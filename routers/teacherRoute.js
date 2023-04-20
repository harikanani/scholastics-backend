const express = require("express");
const teacherController = require("../controllers/teacherController");
const TokenManager = require("../middlewares/TokenManager");
const verify = require("../middlewares/verify");

const teacherRouter = express.Router();

teacherRouter.post("/login", teacherController.teacherLogin);

teacherRouter.post(
	"/addStudent",
	TokenManager.verifyToken,
	verify.isTeacher,
	teacherController.addStudent,
);

module.exports = teacherRouter;
