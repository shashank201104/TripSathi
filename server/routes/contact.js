const express = require("express");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many contact requests. Please try again later.",
  },
});

router.post(
  "/",
  contactLimiter,
  [
    body("name").isString().trim().isLength({ min: 2, max: 100 }),
    body("email").isEmail().normalizeEmail().isLength({ max: 254 }),
    body("message").isString().trim().isLength({ min: 10, max: 5000 }),
    body("website").optional().custom((value) => !String(value).trim()),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid name, email address, and message.",
        errors: errors.array().map(({ path, msg }) => ({ path, msg })),
      });
    }

    const { CONTACT_EMAIL_TO, CONTACT_EMAIL_FROM, SMTP_HOST, SMTP_USER, SMTP_PASS } =
      process.env;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    if (
      !CONTACT_EMAIL_TO ||
      !CONTACT_EMAIL_FROM ||
      !SMTP_HOST ||
      !SMTP_USER ||
      !SMTP_PASS ||
      !Number.isInteger(smtpPort)
    ) {
      return res.status(503).json({
        success: false,
        message: "The contact service is not configured. Please try again later.",
      });
    }

    const { name, email, message } = req.body;
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: smtpPort,
        secure: process.env.SMTP_SECURE === "true" || smtpPort === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      await transporter.sendMail({
        from: CONTACT_EMAIL_FROM,
        to: CONTACT_EMAIL_TO,
        replyTo: email,
        subject: "New TripSathi contact request",
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      });

      return res.status(200).json({
        success: true,
        message: "Your message has been sent. Thank you for contacting TripSathi.",
      });
    } catch (error) {
      console.error("Contact message delivery failed:", error.message);
      return res.status(502).json({
        success: false,
        message: "We could not deliver your message. Please try again later.",
      });
    }
  }
);

module.exports = router;
