import { Injectable } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';

export interface ContactFormData {
  name: string;
  email: string;
  // subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  // EmailJS Configuration
  // TODO: Replace these with your actual EmailJS credentials
  // Get these from https://www.emailjs.com/
  // Steps to setup:
  // 1. Sign up at https://www.emailjs.com/
  // 2. Create an email service (Gmail, Outlook, etc.)
  // 3. Create an email template with variables: {{from_name}}, {{from_email}}, {{subject}}, {{message}}
  // 4. Get your Service ID, Template ID, and Public Key from the dashboard
  // 5. Replace the values below
  private readonly EMAILJS_SERVICE_ID = 'service_x7hgpsd';
  private readonly EMAILJS_TEMPLATE_ID = 'template_g9mkwjz';
  private readonly EMAILJS_PUBLIC_KEY = 'zILdKPzoUxbp8GxPa';
  private readonly RECIPIENT_EMAIL = 'sukesh2001.s2@gmail.com';

  private isInitialized = false;

  constructor() {
    this.initializeEmailJS();
  }

  /**
   * Initialize EmailJS with public key
   */
  private initializeEmailJS(): void {
    if (this.EMAILJS_PUBLIC_KEY) {
      emailjs.init(this.EMAILJS_PUBLIC_KEY);
      this.isInitialized = true;
    } else {
      console.warn('EmailJS Public Key not configured. Please update contact.service.ts with your EmailJS credentials.');
    }
  }

  /**
   * Check if EmailJS is properly configured
   */
  private isConfigured(): boolean {
    return (
        !!this.EMAILJS_SERVICE_ID &&
        !!this.EMAILJS_TEMPLATE_ID &&
        !!this.EMAILJS_PUBLIC_KEY &&
        this.isInitialized    );
  }

  /**
   * Send contact form email using EmailJS
   * @param formData Contact form data
   * @returns Promise that resolves when email is sent successfully
   */
  async sendContactEmail(formData: ContactFormData): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error(
        'EmailJS is not configured. Please update the EmailJS credentials in contact.service.ts'
      );
    }
  
    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        // subject: formData.subject,
        message: formData.message,
        email: this.RECIPIENT_EMAIL  // Optional: allows replying to sender
      };
  
      const response: EmailJSResponseStatus = await emailjs.send(
        this.EMAILJS_SERVICE_ID,
        this.EMAILJS_TEMPLATE_ID,
        templateParams
      );
  
      if (response.status === 200) {
        console.log('Email sent successfully:', response);
      } else {
        throw new Error(`EmailJS returned status ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to send email: ${error.message}`);
      } else {
        throw new Error('Failed to send email. Please try again later.');
      }
    }
  }
}

