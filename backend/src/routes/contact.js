const express = require('express');
const router  = express.Router();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }

    await resend.emails.send({
      from:    'ScriptForge <amit@scriptforgehub.com>', // use this until you verify a domain
      to:      process.env.CONTACT_EMAIL,
      subject: `New message from ${name} via ScriptForge`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      reply_to: email,
    });

    console.log(`[Contact] Email sent from ${name} <${email}>`);
    res.json({ success: true });
  } catch (err) {
    console.error('[Contact] Email send failed:', err.message);
    next(err);
  }
});

module.exports = router;