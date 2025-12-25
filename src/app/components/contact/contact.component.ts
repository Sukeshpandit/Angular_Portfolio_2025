import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ContactService } from '../../services/contact.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, AfterViewInit {
  @ViewChild('contactSection', { static: true }) contactSection!: ElementRef;
  
  contactForm!: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  submitMessageType: 'success' | 'error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngAfterViewInit() {
    this.initAnimations();
  }

  initializeForm() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      // subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  initAnimations() {
    // Contact section animations
    gsap.from(this.contactSection.nativeElement.querySelectorAll('.animate-on-scroll'), {
      scrollTrigger: {
        trigger: this.contactSection.nativeElement,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });
  }

  async onSubmit() {
    if (this.contactForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = '';
    this.submitMessageType = '';

    const formData = this.contactForm.value;
    
    try {
      await this.contactService.sendContactEmail(formData);
      
      // Success response
      this.isSubmitting = false;
      this.submitMessage = 'Thank you for your message! I\'ll get back to you soon.';
      this.submitMessageType = 'success';
      this.contactForm.reset();
      
      // Clear message after 5 seconds
      setTimeout(() => {
        this.submitMessage = '';
        this.submitMessageType = '';
      }, 5000);
    } catch (error) {
      // Error response
      this.isSubmitting = false;
      this.submitMessage = 'Sorry, there was an error sending your message. Please try again later.';
      this.submitMessageType = 'error';
      
      // Clear message after 5 seconds
      setTimeout(() => {
        this.submitMessage = '';
        this.submitMessageType = '';
      }, 5000);
    }
  }

  markFormGroupTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (control?.hasError('required') && control?.touched) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('email') && control?.touched) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength') && control?.touched) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${requiredLength} characters`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      email: 'Email',
      // subject: 'Subject',
      message: 'Message'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.contactForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
