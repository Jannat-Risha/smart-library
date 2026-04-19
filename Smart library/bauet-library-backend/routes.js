const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

router.post("/add-book", async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.send("Book Added");
});

router.get("/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

module.exports = router;