type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export class EmailService {
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.log("\n--- UniSphere Email (dev mode — SMTP not configured) ---");
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(options.text);
      console.log("-----------------------------------------------------\n");
      return true;
    }

    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT || 587) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: SMTP_FROM || `UniSphere <${SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || `<p>${options.text.replace(/\n/g, "<br/>")}</p>`,
      });

      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  async sendLoginAlert(
    email: string,
    firstName: string,
    deviceLabel: string,
    ipAddress?: string,
    loginTime?: Date
  ): Promise<boolean> {
    const when = (loginTime || new Date()).toLocaleString();
    const location = ipAddress || "Unknown location";

    return this.sendEmail({
      to: email,
      subject: "New login to your UniSphere account",
      text: [
        `Hi ${firstName},`,
        "",
        "We noticed a login to your UniSphere account from a new device:",
        "",
        `Device: ${deviceLabel}`,
        `IP address: ${location}`,
        `Time: ${when}`,
        "",
        "If this was you, you can ignore this email.",
        "If you don't recognize this activity, change your password and log out of all devices from your Security settings.",
      ].join("\n"),
    });
  }
}

export const emailService = new EmailService();
