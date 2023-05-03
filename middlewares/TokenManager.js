const jwt = require("jsonwebtoken");
const jwtSecret =
	process.env.JWT_SECRET ||
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890";

module.exports = {
	generateToken: function (user) {
		return jwt.sign(user, jwtSecret, {
			expiresIn: "12h",
		});
	},

	decodeToken: async function (req, res, next) {
		const bearerHeader = req.headers["authorization"];
		if (typeof bearerHeader !== "undefined") {
			// Split at the space
			const bearerToken = bearerHeader.split(" ")[1];
			console.log({ bearerToken });
			try {
				const decoded = jwt.decode(bearerToken);
				console.log({ decoded });
				req.user = decoded;
				console.log({ req: req.user });
				next();
			} catch (err) {
				return res.status(401).send({ message: "Invalid token" });
			}
		} else {
			return res.status(401).send({ message: "Please provide Token" });
		}
	},

	verifyToken: async function (req, res, next) {
		const bearerHeader = req.headers["authorization"];
		// Check if bearer is undefined
		if (typeof bearerHeader !== "undefined") {
			// Split at the space
			const bearerToken = bearerHeader.split(" ")[1];
			// Set the token
			req.token = bearerToken;
			// Next middleware

			jwt.verify(req.token, jwtSecret, (err, authData) => {
				if (err) {
					return res.status(403).send({ message: "Invalid token!" });
				} else {
					req.user = authData;
					next();
				}
			});
		} else {
			return res.status(400).send({ message: "Please provide Token" });
		}
	},
};
