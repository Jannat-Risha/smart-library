const express = require("express");
const Issue = require("../models/Issue");

const router = express.Router();

// Issue Book
router.post("/issue", async (req, res) => {
  const { userId, bookId } = req.body;

  const due = new Date();
  due.setDate(due.getDate() + 7); // 7 days

  const issue = new Issue({
    userId,
    bookId,
    dueDate: due
  });

  await issue.save();
  res.send("Book Issued");
});

// Check Fine + Notification
router.get("/notifications/:userId", async (req, res) => {
  const issues = await Issue.find({ userId: req.params.userId });

  let notifications = [];

  issues.forEach(issue => {
    const today = new Date();

    if (!issue.returned && today > issue.dueDate) {
      const diff = Math.ceil((today - issue.dueDate) / (1000 * 60 * 60 * 24));
      const fine = diff * 10;

      notifications.push({
        message: `Late by ${diff} days. Fine = ${fine} taka`
      });
    }
  });

  res.json(notifications);
});

module.exports = router;