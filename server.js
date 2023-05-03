require("dotenv").config();
const express = require("express");
const adminRouter = require("./routers/adminRoute");
const teacherRouter = require("./routers/teacherRoute");
const studentRouter = require("./routers/studentRoute");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// generate custom token
morgan.token("host", function (req) {
	return req.hostname;
});

// setup the logger
app.use(
	morgan(
		":method :host :url :status :res[content-length] - :response-time ms",
	),
);

mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

app.get("/", (req, res) => {
	return res.status(200).json({ message: "Server Up!!!" });
});

app.use("/admin", adminRouter);

app.use("/teacher", teacherRouter);

app.use("/student", studentRouter);

app.listen(3000, () => {
	console.log("Server started on port 3000");
});
