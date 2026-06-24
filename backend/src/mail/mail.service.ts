import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

@Injectable()
export class MailService {
  private ses: SESv2Client;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('aws.region') || 'ap-southeast-1';
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey');

    this.ses = new SESv2Client({
      region,
      ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
    });
  }

  async sendForgotPasswordEmail(to: string, token: string): Promise<void> {
    const resetLink = `${this.configService.get<string>('app.frontendUrl', 'http://localhost:3000')}/reset-password/${token}`;

    const command = new SendEmailCommand({
      FromEmailAddress: this.configService.get<string>('ses.fromEmail'),
      Destination: {
        ToAddresses: [to],
      },
      Content: {
        Simple: {
          Subject: {
            Data: 'Reset Your Password - UpToYouShop',
          },
          Body: {
            Html: {
              Data: `
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"></head>
                <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                  <h2>Reset Your Password</h2>
                  <p>We received a request to reset the password for your UpToYouShop account.</p>
                  <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
                  <p style="margin: 24px 0;">
                    <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Reset Password
                    </a>
                  </p>
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="color: #4F46E5; word-break: break-all;">${resetLink}</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                  <p style="font-size: 12px; color: #999;">If you did not request a password reset, please ignore this email.</p>
                </body>
                </html>
              `,
            },
            Text: {
              Data: `Reset your UpToYouShop password by visiting: ${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.`,
            },
          },
        },
      },
    });

    await this.ses.send(command);
  }
}
