const express = require("express");
const { registerUser } = require("../controllers/userController");
 
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/current", validateToken, currentUser);

module.exports = router;

