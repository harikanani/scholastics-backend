const studentModel = require("../models/studentModel");
const teacherModel = require("../models/teacherModel");
const classroomModel = require("../models/classroomModel");
const { createPassword } = require("../services");
const jwt = require("jsonwebtoken");
const TokenManager = require("../middlewares/TokenManager");
const AssignmentModel = require("../models/assignmentModel");
const mongoose = require("mongoose");
const { AccessToken } = require("twilio").jwt;
const { VideoGrant } = AccessToken;
const twilio = require("twilio");

// Set up Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;

module.exports = {
	createVideoCall: async (req, res) => {
		try {
			const { subject_code, roomName } = req.body;

			if (!subject_code || !roomName) {
				return res.status(400).json({
					message: "Please provide all data: clasroomId and roomName",
				});
			}

			// Create a new room with Twilio API
			const room = await twilioClient.video.rooms.create({
				uniqueName: roomName,
			});

			// Save the room ID to the corresponding classroom document in the database
			const classroom = await classroomModel.find({ subject_code });
			classroom.videoRoomId = room.sid;
			await classroom.save();

			res.status(201).json({ roomId: room.sid });
		} catch (error) {
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error.message,
			});
		}
	},

	generateAccessToken: async (req, res) => {
		try {
			let { identity, room } = req.body;
			// Generate an access token with video grant
			const videoGrant = new VideoGrant();
			const token = new AccessToken(accountSid, apiKey, apiSecret);
			token.addGrant(videoGrant);
			token.identity = identity;
			token.room = room;
			const accessToken = token.toJwt();

			return res.status(200).json({
				message: "operation success",
				data: { accessToken },
			});
		} catch (error) {
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error.message,
			});
		}
	},

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

	// Teacher Dashboard
	getTeacherDashboard: async (req, res) => {
		try {
			// Get Teacher Details
			let teacherDetails = await teacherModel
				.findOne({
					_id: new mongoose.Types.ObjectId(req.user.teacher_id),
				})
				.lean();

			// check if teacher exists or not
			if (!teacherDetails) {
				return res.status(400).json({
					message: "Teacher not found!",
				});
			}

			// delete credentials
			delete teacherDetails.password;

			// Get Classrooms list of which teacher is part of
			let classrooms = await classroomModel.find({
				teacherId: new mongoose.Types.ObjectId(req.user.teacher_id),
			});

			return res.status(200).json({
				message: "Operation Successful",
				data: { teacherDetails, classrooms },
			});
		} catch (error) {
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error.message,
			});
		}
	},

	postFeed: async (req, res) => {
		try {
			let { classroomId, message, fileUrl } = req.body;

			if (!classroomId || !message) {
				return res.status(400).json({
					message: "Please provide all details",
				});
			}

			// Get Teacher Details
			let teacherDetails = await teacherModel
				.findOne({
					_id: new mongoose.Types.ObjectId(req.user.teacher_id),
				})
				.lean();

			// check if teacher exists or not
			if (!teacherDetails) {
				return res.status(400).json({
					message: "Teacher not found!",
				});
			}

			// Post Feed in classroom
			let classroom = await classroomModel.findOne({
				_id: new mongoose.Types.ObjectId(classroomId),
			});

			if (!classroom) {
				return res.status(400).json({
					message: "Classroom not found!",
				});
			}

			// add feed to classroom: classroom.feeds append
			let newFeed = {
				user: teacherDetails.name,
				message,
				fileUrl,
			};

			classroom.feed.push(newFeed);
			await classroom.save();

			return res.status(200).json({
				message: "Feed Posted Successfully",
				data: classroom,
			});
		} catch (error) {
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error.message,
			});
		}
	},

	getFeed: async (req, res) => {
		// ! model reference for student and teacher in user in feed
		try {
			let { classroomId } = req.body;
			const classroom = await classroomModel.findById(classroomId);

			return res.status(200).json({
				message: "Operation Successful",
				data: classroom.feed,
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error.message,
			});
		}
	},
};
