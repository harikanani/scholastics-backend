const express = require("express");
const adminController = require("../controllers/adminController");
const TokenManager = require("../middlewares/TokenManager");

const adminRouter = express.Router();

adminRouter.post("/addAdmin", adminController.addAdmin);

adminRouter.post(
	"/login",
	// TokenManager.verifyToken,
	adminController.adminLogin,
);

adminRouter.post(
	"/addTeacher",
	TokenManager.verifyToken,
	adminController.addTeacher,
);

module.exports = adminRouter;
