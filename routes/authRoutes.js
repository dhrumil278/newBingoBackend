const express = require('express');
const {
  login,
  otpVerification,
} = require('../controller/User/userAuthController');
const router = express.Router();

router.post('/login', login);
router.post('/otpVerification', otpVerification);

module.exports = router;
