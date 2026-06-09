import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { MailSender } from "../../domain/services/MailSender";

export class MailService implements MailSender {
  private transporter: Transporter | null = null;
  private etherealUrl = "";

  async initialize(): Promise<void> {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      });
      return;
    }

    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("📧 Ethereal email: ", testAccount.user);
    console.log("📧 Ethereal password:", testAccount.pass);
    console.log("📧 Web interface:     https://ethereal.email/login");
  }

  async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    if (!this.transporter) {
      console.log("⚠️ MailService not initialized. Skipping email.");
      return;
    }

    const from = process.env.EMAIL_FROM || "noreply@booking.com";

    const info = await this.transporter.sendMail({ from, to, subject, html });

    if (info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log("📧 Preview:", previewUrl);
      }
      console.log(`📧 Email sent to ${to}: ${subject}`);
    }
  }
}
