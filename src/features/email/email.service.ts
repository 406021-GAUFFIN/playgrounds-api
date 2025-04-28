import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
  }

  async sendVerificationEmail(email: string, code: string) {
    const enableEmail = this.configService.get('ENABLE_EMAIL') === 'true';

    if (!enableEmail) {
      console.log('Email sending is disabled. Would have sent to:', email);
      console.log('Verification code:', code);
      return;
    }

    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3001';
    const verificationUrl = `${frontendUrl}/verify-email?email=${encodeURIComponent(email)}&code=${code}`;

    const msg = {
      to: email,
      from: 'ljgauffin@gmail.com',
      subject: 'Verifica tu correo electrónico',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              color: #4b5563;
              line-height: 1.5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .logo {
              font-weight: 700;
              font-size: 24px;
              margin-bottom: 24px;
            }
            .verification-code {
              background-color: #f3f4f6;
              padding: 16px;
              border-radius: 8px;
              font-size: 24px;
              text-align: center;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              margin-top: 16px;
            }
            .note {
              font-size: 14px;
              color: #6b7280;
              margin-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Playgrounds</div>
            <p>¡Gracias por registrarte! Para completar tu registro, necesitamos verificar tu dirección de correo electrónico.</p>
            <p>Tu código de verificación es:</p>
            <div class="verification-code">
              <strong>${code}</strong>
            </div>
            <p>También puedes verificar tu correo directamente haciendo clic en el siguiente botón:</p>
            <a href="${verificationUrl}" class="button" style="color: white;">Verificar correo electrónico</a>
            <p class="note">Este código y enlace son válidos por una única vez.</p>
            <p class="note">Si no solicitaste esta verificación, puedes ignorar este correo.</p>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
