const express       = require('express');
const router        = express.Router();
const requireAuth   = require('../middleware/requireAuth');
const SupportTicket = require('../db/models/SupportTicket');
const User          = require('../db/models/User');
const { Resend }    = require('resend');

const resend       = new Resend(process.env.RESEND_API_KEY);
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'amit@scriptforgehub.com';

// POST /api/support/ticket
router.post('/ticket', requireAuth, async (req, res, next) => {
  try {
    const { subject, message } = req.body;

    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters' });
    }

    const user = await User.findById(req.user.id).lean();

    // Save to MongoDB
    const ticket = await SupportTicket.create({
      userId:  req.user.id,
      name:    user.name  || req.user.name  || 'Unknown',
      email:   user.email || req.user.email || '',
      subject: subject.trim(),
      message: message.trim(),
    });

    console.log(`[Support] New ticket from ${user.email} — "${subject}"`);

    // Send email notification to you
    try {
      await resend.emails.send({
        from:    `ScriptForge Support <support@scriptforgehub.com>`,
        to:      SUPPORT_EMAIL,
        reply_to: user.email, 
        subject: `[Support] ${subject}`,
        html: `
          <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 24px; background: #0e1118; color: #eef0f6; border-radius: 12px;">
            <h2 style="color: #63dca3; margin-bottom: 4px;">New Support Ticket</h2>
            <p style="color: #666e85; font-size: 12px; margin-bottom: 24px;">Ticket ID: ${ticket._id}</p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; color: #666e85; font-size: 12px; width: 100px;">From</td>
                <td style="padding: 8px 0; color: #eef0f6; font-size: 13px;">${user.name} &lt;${user.email}&gt;</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666e85; font-size: 12px;">Subject</td>
                <td style="padding: 8px 0; color: #eef0f6; font-size: 13px;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666e85; font-size: 12px;">Plan</td>
                <td style="padding: 8px 0; color: #eef0f6; font-size: 13px;">${user.plan || 'free'}</td>
              </tr>
            </table>

            <div style="background: #141720; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #666e85; font-size: 11px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em;">Message</p>
              <p style="color: #eef0f6; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>

            <a href="mailto:${user.email}?subject=Re: ${subject}"
               style="display: inline-block; padding: 10px 20px; background: #63dca3; color: #070d0a; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
              Reply to ${user.name}
            </a>
          </div>
        `,
      });
      console.log(`[Support] Email notification sent to ${SUPPORT_EMAIL}`);
    } catch (emailErr) {
      // Don't fail the request if email fails — ticket is already saved
      console.error('[Support] Email notification failed:', emailErr.message);
    }

    // Also send confirmation email to the user
    try {
      await resend.emails.send({
        from:    `ScriptForge Support <support@scriptforgehub.com>`,
        to:      user.email,
        reply_to: SUPPORT_EMAIL,
        subject: `We received your message — ${subject}`,
        html: `
          <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 24px; background: #0e1118; color: #eef0f6; border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #63dca3, #1a9a6a); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">✦</div>
              <span style="font-family: sans-serif; font-weight: 800; font-size: 18px;">Script<span style="color: #63dca3;">Forge</span></span>
            </div>

            <h2 style="font-family: sans-serif; margin-bottom: 8px;">Hi ${user.name},</h2>
            <p style="color: #a8b0c0; line-height: 1.7; margin-bottom: 24px;">
              Thanks for reaching out! We've received your support request and will get back to you within <strong style="color: #eef0f6;">24 hours</strong>.
            </p>

            <div style="background: #141720; border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 3px solid #63dca3;">
              <p style="color: #666e85; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.1em;">Your message</p>
              <p style="color: #666e85; font-size: 12px; margin-bottom: 8px;"><strong style="color: #eef0f6;">${subject}</strong></p>
              <p style="color: #a8b0c0; font-size: 13px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>

            <p style="color: #666e85; font-size: 12px; line-height: 1.6;">
              In the meantime, you can reply directly to this email if you have anything to add.
            </p>

            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 24px 0;" />
            <p style="color: #666e85; font-size: 11px;">© 2026 ScriptForge · scriptforgehub.com</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('[Support] User confirmation email failed:', emailErr.message);
    }

    res.json({
      success:  true,
      ticketId: ticket._id,
      message:  'Your support request has been received. We will get back to you within 24 hours.',
    });
  } catch (err) { next(err); }
});

// GET /api/support/tickets
router.get('/tickets', requireAuth, async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      tickets: tickets.map(t => ({
        id:        t._id,
        subject:   t.subject,
        message:   t.message,
        status:    t.status,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) { next(err); }
});

module.exports = router;