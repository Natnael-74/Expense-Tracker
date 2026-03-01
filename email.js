import nodemailer from 'nodemailer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import pug from 'pug';
import { convert } from 'html-to-text';
import dotenv from 'dotenv';
import __dirname from './directory.js';

console.log('📧 Email module loaded, NODE_ENV:', process.env.NODE_ENV);

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.fromEmail = process.env.EMAIL_FROM;
    this.fromName = 'Factory Tracker';
  }

  // Nodemailer transport
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    let html;
    try {
      html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
        firstName: this.firstName,
        url: this.url,
        subject,
      });
    } catch (err) {
      console.error('Pug rendering Error 💥', err);
      return;
    }

    if (process.env.NODE_ENV === 'production') {
      // Production - MailerSend
      try {
        const mailerSend = new MailerSend({
          apiKey: process.env.MAILERSEND_API_KEY,
        });

        const sentFrom = new Sender(this.fromEmail, this.fromName);

        const recipients = [new Recipient(this.to, this.firstName)];

        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject(subject)
          .setHtml(html)
          .setText(convert(html));

        await mailerSend.email.send(emailParams);
        console.log('✅ Email sent via MailerSend API to:', this.to);
      } catch (err) {
        console.error('MailerSend Error 💥', err.body || err);
        // Fallback to Nodemailer in production if MailerSend fails
        console.log('🔄 Falling back to Nodemailer...');
        await this.sendWithNodemailer(html, subject);
      }
    } else {
      // Development → Nodemailer
      await this.sendWithNodemailer(html, subject);
    }
  }

  async sendWithNodemailer(html, subject) {
    try {
      // Use mailtrap for development
      const transporter = nodemailer.createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: 'cba9a5c43494c1',
          pass: 'c93aafd8d3ba74',
        },
      });

      await transporter.sendMail({
        from: '"Factory Tracker" <noreply@factorytracker.com>',
        to: this.to,
        subject,
        html,
        text: convert(html),
      });
      console.log('✅ Email sent via Nodemailer to:', this.to);
    } catch (err) {
      console.error('Nodemailer Error 💥', err.message || err);
      // Don't throw - just log the error
    }
  }

  // Welcome email
  async sendWelcome() {
    console.log('📧 Attempting to send welcome email to:', this.to);
    await this.send('welcome', 'Welcome to the Expense Tracker!');
  }

  // Password reset email
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
}

export default Email;
