const { Router } = require("express");
const { Genre } = require("../db");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const genres = await Genre.findAll({});
    res.json(genres);
  } catch (error) {
    console.log(error, "temperament falla");
    res.sendStatus(500);
  }
});

module.exports = router;
