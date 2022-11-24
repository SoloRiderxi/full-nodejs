const express = require("express");
const router = express.Router();
const { eAuth } = require("../middleware/auth");
const Story = require("../models/Stories");

//Redirect to the add form
router.get("/add", eAuth, (req, res) => {
	res.render("stories/add.hbs");
});

//After submitting the add form
router.post("/", eAuth, async (req, res) => {
	try {
		req.body.user = req.user.id;
		await Story.create(req.body);
		res.redirect("/dashboard");
	} catch (err) {
		console.error(err);
	}
});

//A review of all public stories
router.get("/", eAuth, async (req, res) => {
	try {
		const stories = await Story.find({ status: "public" })
			.populate("user")
			.sort({ createdAt: "desc" })
			.lean();

		res.render("stories/index.hbs", { stories, header: "All public stories" });
	} catch (err) {
		console.error(err);
	}
});

//Showing the editting page with the current info
router.get("/edit/:id", eAuth, async (req, res) => {
	const story = await Story.findOne({ _id: req.params.id }).lean();

	if (!story) {
		return res.send("No story was found");
	}

	if (story.user != req.user.id) {
		res.redirect("/stories");
	} else {
		res.render("stories/edit.hbs", { story });
	}
});

router.put("/:id", eAuth, async (req, res) => {
	var story = await Story.findById(req.params.id).lean();

	if (!story) {
		return res.send("No story was found");
	}

	if (story.user != req.user.id) {
		res.redirect("/stories");
	} else {
		story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
			new: true,
			runValidators: true,
		});

		res.redirect("/dashboard");
	}
});

router.delete("/:id", eAuth, async (req, res) => {
	try {
		let story = await Story.findById(req.params.id).lean();

		if (!story) {
			return res.send("No story was found");
		}

		if (story.user != req.user.id) {
			res.redirect("/stories");
		} else {
			await Story.remove({ _id: req.params.id });
			res.redirect("/dashboard");
		}
	} catch (err) {
		return res.send(err);
	}
});

router.get("/:id", eAuth, async (req, res) => {
	try {
		const story = await Story.findById(req.params.id).populate("user").lean();

		res.render("stories/show.hbs", { story });
	} catch (err) {
		console.error(err);
	}
});

router.get("/user/:id", eAuth, async (req, res) => {
	if (req.user.id == req.params.id) {
		const stories = await Story.find({
			user: req.params.id,
		})
			.populate("user")
			.lean();
		res.render("stories/index.hbs", {
			stories,
			header: "Your stories(public & private)",
		});
	} else {
		const stories = await Story.find({
			user: req.params.id,
			status: "public",
		})
			.populate("user")
			.lean();
		res.render("stories/index.hbs", { stories, header: "This user's stories" });
	}
});

module.exports = router;
