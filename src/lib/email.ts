import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_SERVER_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASS,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASS) {
    console.warn('Email not configured — skipping email send')
    return { success: false, reason: 'Email not configured' }
  }

  try {
    const info = await transporter.sendMail({
      from: `"DevPilot AI" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    })
    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false, error }
  }
}
