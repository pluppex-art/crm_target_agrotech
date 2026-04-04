import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string[];
  from: string;
  fromName: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams) {
  return resend.emails.send({
    from: `${params.fromName} <${params.from}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}
