const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/FetchUser");
const Note = require("../models/Notes");
const { body, validationResult } = require("express-validator");
const Notes = require("../models/Notes");

router.get("/fetch-notes", fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/create-note",
  fetchUser,
  [
    body("title", "Enter a Title more than 1 characters").isLength({ min: 1 }),
    body("description", "Description must be at least 1 characters").isLength({
      min: 1,
    }),
  ],
  async (req, res) => {
    // * Return errors if any
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(404).json({ errors: errors.array() });
      }
      const { title, description, tag } = req.body;
      // * Create Note
      let note = await Note.create({
        user: req.userId,
        title: title,
        description: description,
        tag: tag
      });
      res.json({
        Success: "Note added successfully",
        note: {
          id: note._id,
          title: note.title,
          description: note.description,
        }
      });


    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.put("/update-note/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = await req.body;
  const updateNote = {};
  if (title) {
    updateNote.title = title;
  }
  if (description) {
    updateNote.description = description;
  }
  if (tag) {
    updateNote.tag = tag;
  }
  let existNote = await Note.findById(req.params.id);
  if (!existNote) {
    return res.status(404).send("Not found");
  }

  if (existNote.user.toString() !== req.userId) {
    return res.status(404).send("Not allowed");
  }

  existNote = await Note.findByIdAndUpdate(req.params.id, { title: title, description: description, tag: tag });
  res.json({ updateNote });
});

router.delete("/delete-note/:id", fetchUser, async (req, res) => {
  let note = await Note.findById(req.params.id);
  if (!note) {
    return res.status(404).send("Not found");
  }

  if (note.user.toString() !== req.userId) {
    return res.status(404).send("Unauthorized Access!");
  }

  note = await Note.findByIdAndDelete(req.params.id);
  res.json({
    Success: "Note deleted successfully",
    note: {
      id: note._id,
      title: note.title,
      description: note.description
    }
  });

});

module.exports = router;
