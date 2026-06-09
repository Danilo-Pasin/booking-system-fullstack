export interface MailSender {
  send(to: string, subject: string, html: string): Promise<void>;
}
