/**
 * api/sendQuizReport.js
 * Express route — mount this in your Node/Express server:
 *
 *   const sendQuizReport = require('./api/sendQuizReport');
 *   app.use('/api', sendQuizReport);
 *
 * Required env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * POST /api/send-quiz-report
 * Body: {
 *   to: string,            // student or teacher email
 *   studentName: string,
 *   quizTitle: string,
 *   subject: string,
 *   score: number,
 *   total: number,
 *   overallFeedback: string,
 *   answers: { questionText, chosen, correctOption, isCorrect }[]
 * }
 */
router.post('/send-quiz-report', async (req, res) => {
  const {
    to,
    studentName,
    quizTitle,
    subject,
    score,
    total,
    overallFeedback,
    answers,
  } = req.body;

  if (!to || !quizTitle) {
    return res.status(400).json({ error: 'Missing required fields: to, quizTitle' });
  }

  const pct = Math.round((score / total) * 100);
  const scoreColor = pct >= 80 ? '#1a3a28' : pct >= 50 ? '#854F0B' : '#A32D2D';
  const scoreBg   = pct >= 80 ? '#EAF3DE' : pct >= 50 ? '#FAEEDA' : '#FCEBEB';

  const reviewRows = answers
    .map(
      (a, i) => `
        <tr style="border-bottom:1px solid #f0f0f0">
          <td style="padding:10px 8px;font-size:13px;color:#555">${i + 1}. ${a.questionText}</td>
          <td style="padding:10px 8px;font-size:13px;text-align:center">
            ${
              a.isCorrect
                ? '<span style="color:#27500A;font-weight:600">✓ Correct</span>'
                : `<span style="color:#791F1F">${a.chosen}</span>`
            }
          </td>
          <td style="padding:10px 8px;font-size:13px;color:#27500A;text-align:center">${a.correctOption}</td>
        </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e8e8;max-width:600px;width:100%">

        <tr><td style="background:#1a3a28;padding:24px 32px">
          <p style="margin:0;font-size:20px;font-weight:600;color:#ffffff">Quiz Report</p>
          <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.7)">${quizTitle} · ${subject || ''}</p>
        </td></tr>

        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0">
          <p style="margin:0 0 4px;font-size:14px;color:#888">Student</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#1a1a1a">${studentName || 'Student'}</p>
        </td></tr>

        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;text-align:center">
          <div style="display:inline-block;background:${scoreBg};border-radius:50%;width:88px;height:88px;line-height:88px;font-size:26px;font-weight:700;color:${scoreColor}">${pct}%</div>
          <p style="margin:12px 0 0;font-size:15px;color:#555">${score} out of ${total} correct</p>
        </td></tr>

        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0">
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#1a1a1a">Personalized feedback</p>
          <p style="margin:0;font-size:14px;color:#444;line-height:1.7;background:#f9f9f9;border-radius:8px;padding:14px 16px;border-left:3px solid #1a3a28">${overallFeedback || ''}</p>
        </td></tr>

        <tr><td style="padding:24px 32px">
          <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1a1a1a">Question review</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #f0f0f0">
            <thead>
              <tr style="background:#f9f9f9">
                <th style="padding:10px 8px;font-size:12px;color:#888;font-weight:500;text-align:left">Question</th>
                <th style="padding:10px 8px;font-size:12px;color:#888;font-weight:500;text-align:center">Your answer</th>
                <th style="padding:10px 8px;font-size:12px;color:#888;font-weight:500;text-align:center">Correct</th>
              </tr>
            </thead>
            <tbody>${reviewRows}</tbody>
          </table>
        </td></tr>

        <tr><td style="padding:16px 32px;background:#f9f9f9;text-align:center">
          <p style="margin:0;font-size:12px;color:#aaa">Sent via your LMS Quiz Maker · ${new Date().toLocaleDateString()}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"LMS Quiz Maker" <${process.env.SMTP_FROM}>`,
      to,
      subject: `Quiz Report — ${quizTitle} (${pct}%)`,
      html,
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('Nodemailer error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
