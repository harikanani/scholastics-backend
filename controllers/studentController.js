const studentModel = require("../models/studentModel");
const TokenManager = require("../middlewares/TokenManager");
const classroomModel = require("../models/classroomModel");
const teacherModel = require("../models/teacherModel");
const mongoose = require("mongoose");
const AssignmentModel = require("../models/assignmentModel");
module.exports = {
	studentLogin: async (req, res) => {
		try {
			let { email, password, enrollment_number } = req.body;

			if (!enrollment_number && !email) {
				return res.status(400).json({
					message: "Please provide email / enrollment number",
				});
			}

			if (!password) {
				return res
					.status(400)
					.json({ message: "Please provide all the details" });
			}

			const student = await studentModel.findOne({
				$or: [
					{ email: email },
					{ enrollment_number: enrollment_number },
				],
			});

			if (!student) {
				return res.status(400).json({ message: "Invalid credentials" });
			}

			if (student.password !== password) {
				return res.status(400).json({ message: "Invalid credentials" });
			}

			// generate token
			const token = TokenManager.generateToken({
				student_id: student._id,
				email: student.email,
			});

			// fetch list of subjects of student (student in classroom)
			const subjects = await classroomModel.find({
				students: student._id,
			});

			subjects.map((sub) => {
				sub.students = [];
				delete sub.students;
			});

			return res.status(200).json({
				message: "Login successful",
				data: {
					student: {
						name: student.name,
						email: student.email,
						enrollment_number: student.enrollment_number,
					},
					subjects,
					token,
				},
			});
		} catch (error) {
			return res.status(500).json({ message: error.message });
		}
	},

	// join classroom by students using _id of classroom
	joinClassroom: async (req, res) => {
		try {
			let classroom_id = req.params.id;

			if (!classroom_id) {
				return res.status(400).json({
					message: "Classroom id is required",
				});
			}

			let classroom = await classroomModel.findOne({
				_id: new mongoose.Types.ObjectId(classroom_id),
			});

			if (!classroom) {
				return res.status(400).json({
					message: "Classroom not found",
				});
			}

			let student = await studentModel.findOne({
				_id: new mongoose.Types.ObjectId(req.user.student_id),
			});

			if (!student) {
				return res.status(400).json({
					message: "Student not found",
				});
			}

			// check if student is already in classroom
			let isStudentInClassroom = classroom.students.find(
				(studentId) => studentId.toString() === student._id.toString(),
			);

			if (isStudentInClassroom) {
				return res.status(400).json({
					message: "Student already in classroom",
				});
			}

			// add student to classroom
			classroom.students.push(student._id);
			await classroom.save();

			// add classroom to student
			student.classrooms.push(classroom._id);
			await student.save();

			return res.status(200).json({
				message: "Student joined classroom successfully",
				data: classroom,
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error.message,
			});
		}
	},

	getClassroomDetails: async (req, res) => {
		const studentId = req.user.student_id;
		const classroomId = req.params.id;

		try {
			const classroom = await classroomModel
				.findById(classroomId)
				.populate("teacherId", "name email")
				.populate("students", "name email")
				.populate({
					path: "assignments",
					select: "-__v",
					populate: {
						path: "submissions.studentId",
						select: "name email",
					},
				});

			if (!classroom) {
				return null;
			}

			const teacherDetails = {
				name: classroom.teacherId.name,
				email: classroom.teacherId.email,
			};

			const students = classroom.students.map((student) => {
				return { name: student.name, email: student.email };
			});

			let assignments = classroom.assignments.map((assignment) => {
				const submission = assignment.submissions.find(
					(submission) =>
						submission.studentId.toString() ===
						studentId.toString(),
				);

				console.log(submission);
				return {
					name: assignment.name,
					description: assignment.description,
					classroom_details: {
						classroom_name: classroom.subject_name,
						classroom_subject: classroom.subject_code,
					},
					dueDate: assignment.dueDate,
					fileUrl: assignment.fileUrl,
					marks: assignment.marks,
					submission: submission
						? {
								submissionDate: submission.submissionDate,
								fileUrl: submission.fileUrl,
								feedback: submission.feedback,
								marksObtained: submission.marksObtained,
						  }
						: { isSubmitted: false },
				};
			});

			return res.status(200).json({
				message: "operation successful",
				data: {
					_id: classroom._id,
					subject_name: classroom.subject_name,
					subject_code: classroom.subject_code,
					teacher_details: teacherDetails,
					students: students,
					assignments: assignments,
				},
			});
		} catch (error) {
			return res.status(500).json({
				message: "Internal Server Error!",
				error: error.message,
			});
		}
	},

	submitAssignment: async (req, res) => {
		try {
			const { assignment_id, fileUrl } = req.body;
			const studentId = req.user.student_id;

			if (!assignment_id || !fileUrl) {
				return res.status(400).json({
					message: "Please provide all the details",
				});
			}

			const assignment = await AssignmentModel.findById(assignment_id);

			if (!assignment) {
				return res.status(400).json({
					message: "Assignment not found",
				});
			}

			const submission = assignment.submissions.find(
				(s) => s.studentId.toString() === studentId,
			);

			if (submission) {
				return res.status(400).json({
					message: "Assignment already submitted",
				});
			}

			assignment.submissions.push({
				studentId: new mongoose.Types.ObjectId(studentId),
				submissionDate: Date.now(),
				fileUrl: fileUrl,
			});

			await assignment.save();

			return res.status(200).json({
				message: "Assignment submitted successfully",
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
