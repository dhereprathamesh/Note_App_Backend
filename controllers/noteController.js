const Note = require("../models/Note");

const getNotes = async (req, res) => {
  const userId = req.user.id;
  const notes = await Note.find({ user: userId });
  res.status(200).json(notes);
};

const createNote = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  const note = await Note.create({ title, content, user: userId });
  res.status(201).json(note);
};

const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const note = await Note.findByIdAndUpdate(
    id,
    { title, content, updatedAt: Date.now() },
    { new: true }
  );
  res.status(200).json(note);
};

const deleteNote = async (req, res) => {
  const { id } = req.params;

  await Note.findByIdAndDelete(id);
  res.status(200).json({ message: "Note deleted successfully" });
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
