import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const ses = new SESClient({ region: process.env.AWS_REGION || 'ap-southeast-1' })

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password/${token}`

  const command = new SendEmailCommand({
    Source: process.env.EMAIL_FROM || 'noreply@uptoyoushop.com',
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: 'Reset your UpToYouShop password', Charset: 'UTF-8' },
      Body: {
        Html: {
          Data: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
              <h2>Reset your password</h2>
              <p>Click the button below to reset your password. This link expires in 1 hour.</p>
              <a href="${resetUrl}"
                 style="display:inline-block;padding:12px 24px;background:#0066cc;color:white;text-decoration:none;border-radius:4px;">
                Reset Password
              </a>
              <p style="margin-top:24px;font-size:12px;color:#888;">
                If you didn't request this, please ignore this email.<br>
                <a href="${resetUrl}">${resetUrl}</a>
              </p>
            </div>
          `,
          Charset: 'UTF-8',
        },
      },
    },
  })

  await ses.send(command)
}
