const express = require("express");
const adminRouter = require("./routers/adminRoute");
const teacherRouter = require("./routers/teacherRoute");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/scholastics", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

app.use("/admin", adminRouter);

app.use("/teacher", teacherRouter);

app.listen(3000, () => {
	console.log("Server started on port 3000");
});
