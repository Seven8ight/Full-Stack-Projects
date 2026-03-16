import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import { SMTP_KEY, SMTP_LOGIN } from "../Src/Config/Env.js";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: SMTP_LOGIN,
    pass: SMTP_KEY,
  },
});

export async function sendMail(userEmail: string, code: any) {
  try {
    const mailInfo: SMTPTransport.SentMessageInfo = await transporter.sendMail({
      from: "developingarena@gmail.com",
      to: userEmail,
      subject: "Lifeflow - Authentication Code",
      text: "Hello world, this first one is a test",
      html: `<!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:40px 0;background-color:#f4f6f8;">
            <tr>
              <td align="center">
          
                <table role="presentation" width="420" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;padding:30px;">
                  
                  <tr>
                    <td align="center" style="font-size:22px;font-weight:bold;color:#333;">
                      Verify Your Account
                    </td>
                  </tr>
          
                  <tr>
                    <td style="padding-top:15px;font-size:14px;color:#555;text-align:center;">
                      Use the verification code below to complete your sign in.
                    </td>
                  </tr>
          
                  <tr>
                    <td align="center" style="padding:30px 0;">
                      <div style="font-size:32px;letter-spacing:6px;font-weight:bold;color:#2b6cb0;background:#f1f5f9;padding:12px 20px;border-radius:6px;display:inline-block;">
                        ${code}
                      </div>
                    </td>
                  </tr>
          
                  <tr>
                    <td style="font-size:13px;color:#777;text-align:center;">
                      This code will expire in 10 minutes.<br/>
                      If you didn't request this code, you can safely ignore this email.
                    </td>
                  </tr>
          
                  <tr>
                    <td style="padding-top:30px;font-size:12px;color:#aaa;text-align:center;">
                      © 2026 Lifeflow Blogs
                    </td>
                  </tr>
          
                </table>
          
              </td>
            </tr>
          </table>
        </body>
      </html>`,
    });

    console.log("Message sent: %s", mailInfo.messageId);
  } catch (error) {
    throw error;
  }
}
