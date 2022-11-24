const express = require("express");
const router = express.Router();
const { eAuth, eGuest } = require("../middleware/auth");
const Story = require("../models/Stories");

//Landing page
router.get("/", eGuest, (req, res) => {
	res.render("login.hbs", {
		layout: "login",
	});
});

//Dashboard page showing all posts of a user
router.get("/dashboard", eAuth, async (req, res) => {
	try {
		const stories = await Story.find({ user: req.user.id }).lean();
		res.render("dashboard.hbs", { name: req.user.displayName, stories });
	} catch (err) {
		console.error(err);
	}
});

module.exports = router;
