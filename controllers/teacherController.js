const studentModel = require("../models/studentModel");
const teacherModel = require("../models/teacherModel");
const classroomModel = require("../models/classroomModel");
const { createPassword } = require("../services");
const jwt = require("jsonwebtoken");
const TokenManager = require("../middlewares/TokenManager");
const AssignmentModel = require("../models/assignmentModel");

module.exports = {
	teacherLogin: async function (req, res) {
		try {
			let { email, password } = req.body;

			if (!email && !password) {
				return res.status(400).json({
					message: "Email and password are required",
				});
			}

			// check if user in database and if it is generate jwt token and send it to response, otherwise send error message: "Invalid email or password"
			let teacher = await teacherModel.findOne({ email, password });

			if (teacher) {
				let token = TokenManager.generateToken({
					teacher_id: teacher._id,
					email: teacher.email,
				});

				res.status(200).json({
					message: "Teacher logged in successfully",
					data: {
						teacher,
						token,
					},
				});
			} else {
				res.status(400).json({
					message: "Invalid email or password",
				});
			}
		} catch (error) {
			console.log(error);
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error.message,
			});
		}
	},
	addStudent: async function (req, res) {
		try {
			const { name, email, enrollmentNo } = req.body;
			let password = createPassword(8);
			const student = await studentModel({
				name,
				email,
				password,
				enrollment_number: enrollmentNo,
			}).save();
			return res.status(200).json({
				message: "Student added successfully",
				data: student,
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({
				message: "Internal Server Error",
				error: error.message,
			});
		}
	},

	createClassroom: async (req, res) => {
		try {
			let { subjectName, subjectCode } = req.body;

			if (
				!subjectName &&
				!subjectCode &&
				!req.user &&
				!req.user.teacher_id
			) {
				return res.status(400).json({
					message:
						"Subject name, subject code and teacher id are required",
				});
			}

			let teacher = await teacherModel.findOne({
				_id: req.user.teacher_id,
			});

			if (!teacher) {
				return res.status(400).json({
					message: "Teacher not found",
				});
			}

			let classroom = await classroomModel.findOne({ subjectCode });

			if (classroom) {
				return res.status(400).json({
					message: "Classroom already exists",
				});
			}

			let newClassroom = await classroomModel({
				subject_name: subjectName,
				subject_code: subjectCode,
				teacherId: req.user.teacher_id,
			}).save();

			return res.status(200).json({
				message: "Classroom created successfully",
				data: newClassroom,
			});
		} catch (error) {
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error.message,
			});
		}
	},

	createAssignment: async (req, res) => {
		try {
			let { classroomId, name, description, dueDate, fileUrl, marks } =
				req.body;

			if (!classroomId || !name || !description || !dueDate || !marks) {
				return res.status(400).json({
					message: "Please provide all details",
				});
			}

			// Check if the classroom exists
			const classroom = await classroomModel.findById(classroomId);
			if (!classroom) {
				return res.status(404).json({ message: "Classroom not found" });
			}

			// Create a new assignment document
			const assignment = new AssignmentModel({
				name,
				description,
				classrrom_id: classroomId,
				dueDate,
				fileUrl,
				marks,
			});

			// Save the assignment to the database
			const savedAssignment = await assignment.save();

			// Add the assignment to the classroom's assignments array
			classroom.assignments.push(savedAssignment._id);
			await classroom.save();

			return res.status(200).json({
				message: "Assignment Created Successfully",
				data: savedAssignment,
			});
		} catch (error) {
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error.message,
			});
		}
	},

	// mark Assignment
	gradeAndFeedbackAssignment: async (req, res) => {
		try {
			const { assignmentId, studentId, marksObtained, feedback } =
				req.body;

			if (!assignmentId || !studentId || !marksObtained || !feedback) {
				return res.status(400).json({
					message: "Please provide all details",
				});
			}

			const assignment = await AssignmentModel.findById(assignmentId);

			if (!assignment) {
				return res.status(400).json({
					message: "Assignment not found",
				});
			}

			const submission = assignment.submissions.find(
				(s) => s.studentId.toString() === studentId,
			);

			if (!submission) {
				return res.status(400).json({
					message: "Submission not found",
				});
			}

			submission.marksObtained = marksObtained;
			submission.feedback = feedback;

			await assignment.save();

			return res.status(200).json({
				message: "Marks and feedback assigned successfully",
				data: assignment,
			});
		} catch (error) {
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error.message,
			});
		}
	},
};
