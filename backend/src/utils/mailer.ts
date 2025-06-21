import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export function sendMail({ to, subject, text, html }: SendMailOptions) {
  return transporter.sendMail({
    from: '"Neóptica Intranet" <no-reply@neoptica.com>',
    to,
    subject,
    text,
    html,
  });
}
