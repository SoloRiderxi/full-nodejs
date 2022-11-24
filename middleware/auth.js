module.exports = {
	eAuth: function (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect("/");
		}
	},

	eGuest: function (req, res, next) {
		if (req.isAuthenticated()) {
			res.redirect("/dashboard");
		} else {
			return next();
		}
	},
};
