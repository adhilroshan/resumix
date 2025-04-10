# Resumix PWA

A Progressive Web Application (PWA) that helps users match their resume to job descriptions using AI. Resumix analyzes the gap between your resume and the job you want, providing actionable recommendations to improve your chances.

## Features

- **Resume Upload & Parsing**: Upload your PDF resume for automatic text extraction
- **User Profile Management**: Store your professional information and skills
- **Job Description Analysis**: Paste job descriptions you find interesting
- **AI-Powered Matching**: Uses LLMs through OpenRouter to analyze the match
- **Smart Recommendations**: Get actionable feedback on how to improve your resume
- **Skills Gap Analysis**: Identify missing skills needed for the job
- **Works Offline**: As a PWA, Resumix can be installed on your device and used offline
- **Device Storage**: All your data is stored locally on your device for privacy

## Getting Started

### Prerequisites

- An OpenRouter API key (https://openrouter.ai)
- A modern web browser (Chrome, Firefox, Edge, etc.)

### API Key Setup

There are two ways to provide OpenRouter API keys:

1. **Environment Variables (Recommended for deployment)**:
   - Create a `.env` file based on the `.env.example` template
   - Add your OpenRouter API key(s) to the `VITE_OPENROUTER_API_KEYS` variable
   - You can add multiple keys separated by commas for automatic rotation
   - For production deployment, add these keys to your platform's environment variables

2. **User Interface**:
   - If no environment keys are available, users will need to add their own API keys
   - The app includes an API key management interface
   - Advanced users can still add their own keys even if environment keys exist

### Installation

Resumix is a web application that can be installed as a PWA:

1. Visit the deployed app in your browser
2. For a better experience, install it as a PWA:
   - Chrome/Edge: Click the install icon in the address bar
   - Mobile: Add to home screen from your browser menu

### Development Setup

If you want to run Resumix locally for development:

```bash
# Clone the repository
git clone https://github.com/yourusername/resumix.git # Assuming repo name change

# Navigate to the project directory
cd resumix

# Install dependencies
npm install

# Copy the environment example file and add your OpenRouter API key
cp .env.example .env
# Edit .env with your API key(s)

# Start the development server
npm start
```

## How It Works

1. **Initial Setup**:
   - Upload your resume PDF to Resumix
   - Fill out additional professional information
   - Add your skills or use auto-detected ones

2. **Job Matching**:
   - Paste a job description you're interested in
   - Resumix uses AI to analyze the match between your profile and the job
   - Review the overall match percentage and specific areas to improve

3. **Resume Improvement**:
   - Follow the actionable recommendations from Resumix to improve your resume
   - Address the identified skill gaps
   - Update your profile with new skills as you acquire them

## Technologies Used

- TypeScript
- React
- TanStack Router
- Mantine UI
- PDF.js for PDF parsing
- OpenRouter API for AI analysis
- Progressive Web App (PWA) capabilities

## Privacy

Your data never leaves your device except when sent to OpenRouter for analysis by Resumix. The app does not store your resume or personal information on any server.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenRouter for providing the AI API
- TanStack for the routing framework
- Mantine for the UI components
