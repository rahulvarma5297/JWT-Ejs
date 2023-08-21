const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const data = req.params;
  // const data = req.query;
  res.json({
    name: "rahul",
  });
});

router.post("/", (req, res) => {
  const data = req.body;
  res.json(data);
});

module.exports = router;
