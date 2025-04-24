import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendVerificationEmail(email: string, code: string) {
    await this.resend.emails.send({
      from: 'Playgrounds <playgrounds@resend.dev>',
      to: email,
      subject: 'Verifica tu correo electrónico',
      html: `
        <h1>Bienvenido a Playgrounds</h1>
        <p>Tu código de verificación es: <strong>${code}</strong></p>
        <p>Este código es válido por una única vez.</p>
      `,
    });
  }
}
