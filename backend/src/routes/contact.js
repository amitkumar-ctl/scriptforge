const express = require('express');
const router  = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }
    // Log for now — swap for email service (Resend, SendGrid) later
    console.log(`[Contact] From: ${name} <${email}>\n${message}`);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;