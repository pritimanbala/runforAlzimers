import nodemailer from 'nodemailer'

type SendOtpEmailOptions = {
  to: string
  firstName: string
  otp: string
}

function getSmtpPort() {
  return Number(process.env.SMTP_PORT || 587)
}

function getSmtpSecure() {
  const explicitSecure = process.env.SMTP_SECURE

  if (explicitSecure) {
    return explicitSecure === 'true'
  }

  return getSmtpPort() === 465
}

function createTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('Missing SMTP_HOST, SMTP_USER, or SMTP_PASS environment variable')
  }

  return nodemailer.createTransport({
    host,
    port: getSmtpPort(),
    secure: getSmtpSecure(),
    auth: {
      user,
      pass,
    },
  })
}

export async function sendOtpEmail({ to, firstName, otp }: SendOtpEmailOptions) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER

  if (!from) {
    throw new Error('Missing SMTP_FROM or SMTP_USER environment variable')
  }

  const transporter = createTransporter()

  await transporter.sendMail({
    from,
    to,
    subject: 'Your Run for Alzheimer\'s verification OTP',
    text: [
      `Hi ${firstName},`,
      '',
      `Your verification OTP is ${otp}.`,
      'This code expires in 5 minutes.',
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <p>Hi ${firstName},</p>
        <p>Your verification OTP is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #6d28d9;">${otp}</p>
        <p>This code expires in 5 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  })
}

