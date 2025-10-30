'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Code,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: OnboardingField[];
}

interface OnboardingField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'tags';
  placeholder: string;
  required: boolean;
  value?: string | string[];
}

export function MobileOnboardingFlow() {
  const {
    resume,
    resumeValidation,
    updateResumeData,
    isLoading
  } = useAppStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!resumeValidation || resumeValidation.isValid) {
    return null;
  }

  const onboardingSteps: OnboardingStep[] = [];

  // Add contact info step if missing
  if (!resumeValidation.requiredFields.contactInfo) {
    onboardingSteps.push({
      id: 'contact',
      title: 'Contact Information',
      description: 'How can employers reach you?',
      icon: <User className="h-6 w-6" />,
      fields: [
        {
          id: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'your.email@example.com',
          required: true,
          value: resume.parsedData?.contactInfo?.email || ''
        },
        {
          id: 'phone',
          label: 'Phone Number',
          type: 'tel',
          placeholder: '+1 (555) 123-4567',
          required: false,
          value: resume.parsedData?.contactInfo?.phone || ''
        }
      ]
    });
  }

  // Add skills step if missing
  if (!resumeValidation.requiredFields.skills) {
    onboardingSteps.push({
      id: 'skills',
      title: 'Professional Skills',
      description: 'What are your key skills?',
      icon: <Code className="h-6 w-6" />,
      fields: [
        {
          id: 'skills',
          label: 'Skills (comma separated)',
          type: 'tags',
          placeholder: 'JavaScript, React, Node.js, Python...',
          required: true,
          value: resume.parsedData?.skills || []
        }
      ]
    });
  }

  // Add experience step if missing
  if (!resumeValidation.requiredFields.experience) {
    onboardingSteps.push({
      id: 'experience',
      title: 'Work Experience',
      description: 'Tell us about your work history',
      icon: <Briefcase className="h-6 w-6" />,
      fields: [
        {
          id: 'currentJobTitle',
          label: 'Current/Most Recent Job Title',
          type: 'text',
          placeholder: 'Software Engineer',
          required: true
        },
        {
          id: 'currentCompany',
          label: 'Company Name',
          type: 'text',
          placeholder: 'Tech Company Inc.',
          required: true
        },
        {
          id: 'experienceDescription',
          label: 'Brief Description of Responsibilities',
          type: 'textarea',
          placeholder: 'Describe your key responsibilities and achievements...',
          required: true
        }
      ]
    });
  }

  // Add education step if missing
  if (!resumeValidation.requiredFields.education) {
    onboardingSteps.push({
      id: 'education',
      title: 'Education',
      description: 'What is your educational background?',
      icon: <GraduationCap className="h-6 w-6" />,
      fields: [
        {
          id: 'degree',
          label: 'Degree/Certification',
          type: 'text',
          placeholder: 'Bachelor of Science in Computer Science',
          required: true
        },
        {
          id: 'institution',
          label: 'Institution Name',
          type: 'text',
          placeholder: 'University Name',
          required: true
        },
        {
          id: 'year',
          label: 'Year Completed',
          type: 'text',
          placeholder: '2020',
          required: false
        }
      ]
    });
  }

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    currentStepData.fields.forEach(field => {
      if (field.required && !formData[fieldId]) {
        newErrors[field.id] = `${field.label} is required`;
      }

      if (field.type === 'email' && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.id])) {
          newErrors[field.id] = 'Please enter a valid email address';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Update resume data with all collected information
      const updates: any = {};

      if (formData.email || formData.phone) {
        updates.parsedData = {
          ...resume.parsedData,
          contactInfo: {
            ...resume.parsedData?.contactInfo,
            email: formData.email,
            phone: formData.phone
          }
        };
      }

      if (formData.skills) {
        const skills = typeof formData.skills === 'string'
          ? formData.skills.split(',').map(s => s.trim()).filter(s => s)
          : formData.skills;

        updates.parsedData = {
          ...updates.parsedData || resume.parsedData,
          skills
        };
      }

      if (formData.currentJobTitle || formData.currentCompany) {
        const experience = resume.parsedData?.experience || [];

        if (experience.length === 0) {
          updates.parsedData = {
            ...updates.parsedData || resume.parsedData,
            experience: [{
              title: formData.currentJobTitle,
              company: formData.currentCompany,
              duration: 'Present',
              description: formData.experienceDescription ? [formData.experienceDescription] : [],
              skills: []
            }]
          };
        }
      }

      if (formData.degree || formData.institution) {
        const education = resume.parsedData?.education || [];

        if (education.length === 0) {
          updates.parsedData = {
            ...updates.parsedData || resume.parsedData,
            education: [{
              degree: formData.degree,
              institution: formData.institution,
              year: formData.year || ''
            }]
          };
        }
      }

      await updateResumeData(updates);
    } catch (error) {
      console.error('Failed to update resume:', error);
    }
  };

  const renderField = (field: OnboardingField) => {
    const value = formData[field.id] || field.value || '';
    const error = errors[field.id];

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[100px]"
            rows={4}
          />
        );

      case 'tags':
        return (
          <input
            id={field.id}
            type="text"
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      default:
        return (
          <input
            id={field.id}
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Complete Your Profile
          </h3>
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {onboardingSteps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            {currentStepData.icon}
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              {currentStepData.title}
            </h4>
            <p className="text-sm text-gray-600">
              {currentStepData.description}
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {currentStepData.fields.map((field) => (
            <div key={field.id}>
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0 || isLoading}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={isLoading}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : currentStep === onboardingSteps.length - 1 ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Complete
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}