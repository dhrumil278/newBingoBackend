const express = require('express');
const { login } = require('../controller/User/userAuthController');
const router = express.Router();

router.post('/login', login);

module.exports = router;
