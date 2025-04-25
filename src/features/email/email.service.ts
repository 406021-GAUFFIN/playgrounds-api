import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendVerificationEmail(email: string, code: string) {
    const msg = {
      to: email,
      from: 'ljgauffin@gmail.com',
      subject: 'Verifica tu correo electrónico',
      html: `
        <h1>Bienvenido a Playgrounds</h1>
        <p>Tu código de verificación es: <strong>${code}</strong></p>
        <p>Este código es válido por una única vez.</p>
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
