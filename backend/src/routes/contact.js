const express = require('express');
const router  = express.Router();
const { Resend } = require('resend');

const resend        = new Resend(process.env.RESEND_API_KEY);
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'amit@scriptforgehub.com';

router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }

    // 1. Notify you (admin)
    try {
      await resend.emails.send({
        from:     'ScriptForge Support <support@scriptforgehub.com>',
        to:       SUPPORT_EMAIL,
        reply_to: email,                           // reply goes directly to the user
        subject:  `New message from ${name} via ScriptForge`,
        html: `
          <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 24px; background: #0e1118; color: #eef0f6; border-radius: 12px;">
            <h2 style="color: #63dca3; margin-bottom: 4px;">New Contact Form Submission</h2>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; color: #666e85; font-size: 12px; width: 80px;">Name</td>
                <td style="padding: 8px 0; color: #eef0f6; font-size: 13px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666e85; font-size: 12px;">Email</td>
                <td style="padding: 8px 0; color: #eef0f6; font-size: 13px;">${email}</td>
              </tr>
            </table>

            <div style="background: #141720; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #666e85; font-size: 11px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em;">Message</p>
              <p style="color: #eef0f6; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>

            <a href="mailto:${email}?subject=Re: Your message to ScriptForge"
               style="display: inline-block; padding: 10px 20px; background: #63dca3; color: #070d0a; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
              Reply to ${name}
            </a>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('[Contact] Admin notification failed:', emailErr.message);
    }

    // 2. Confirmation email to the user
    try {
      await resend.emails.send({
        from:     'ScriptForge Support <support@scriptforgehub.com>',
        to:       email,
        reply_to: SUPPORT_EMAIL,                   // reply goes to your support inbox
        subject:  `We received your message, ${name}!`,
        html: `
          <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 24px; background: #0e1118; color: #eef0f6; border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #63dca3, #1a9a6a); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">✦</div>
              <span style="font-family: sans-serif; font-weight: 800; font-size: 18px;">Script<span style="color: #63dca3;">Forge</span></span>
            </div>

            <h2 style="font-family: sans-serif; margin-bottom: 8px;">Hi ${name},</h2>
            <p style="color: #a8b0c0; line-height: 1.7; margin-bottom: 24px;">
              Thanks for reaching out! We've received your message and will get back to you within <strong style="color: #eef0f6;">24 hours</strong>.
            </p>

            <div style="background: #141720; border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 3px solid #63dca3;">
              <p style="color: #666e85; font-size: 11px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em;">Your message</p>
              <p style="color: #a8b0c0; font-size: 13px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>

            <p style="color: #666e85; font-size: 12px; line-height: 1.6;">
              You can reply directly to this email if you have anything to add.
            </p>

            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 24px 0;" />
            <p style="color: #666e85; font-size: 11px;">© 2026 ScriptForge · scriptforgehub.com</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('[Contact] User confirmation email failed:', emailErr.message);
    }

    console.log(`[Contact] Message received from ${name} <${email}>`);
    res.json({ success: true, message: 'Your message has been received. We will get back to you within 24 hours.' });
  } catch (err) {
    console.error('[Contact] Failed:', err.message);
    next(err);
  }
});

module.exports = router;