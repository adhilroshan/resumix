# Resumix

Resumix is an AI-powered resume analysis tool that helps you understand how well your resume matches job descriptions and provides actionable feedback to improve your chances of getting hired.

## Features

- **Resume Upload**: Supports PDF, DOCX, TXT, and Markdown files
- **AI Analysis**: Uses OpenRouter API with DeepSeek model for intelligent resume-job matching
- **Privacy-Focused**: All processing happens locally in your browser; no personal data uploaded to external servers
- **Match Scoring**: Provides percentages for overall match, skills match, experience match, and education match
- **Skills Gap Analysis**: Identifies missing skills and suggests improvements
- **Progress Tracking**: Stores analysis history so you can compare different job applications
- **Data Export/Import**: Backup and restore your data locally

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenRouter API key (get one at [openrouter.ai/keys](https://openrouter.ai/keys))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resumix
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your OpenRouter API key to `.env.local`:
```
NEXT_PUBLIC_OPENROUTER_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
bun dev
# or
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Upload Resumes**: Drag and drop or click to upload your resume files (PDF, DOCX, TXT, MD supported)
2. **Add Job Descriptions**: Click "Add Job Description" and paste job details
3. **Analyze Compatibility**: Select a resume and job, then click "Analyze Compatibility"
4. **Review Results**: View match scores, strengths, missing skills, and improvement recommendations
5. **Track Progress**: View your analysis history to compare different job applications

## Architecture

- **Frontend**: Next.js 16 with React 19 and TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **File Processing**: react-dropzone, pdf-parse, mammoth
- **AI Integration**: OpenRouter API with DeepSeek model
- **Storage**: Browser localStorage for privacy

## Privacy

Resumix is designed with privacy in mind:
- All resume and job data is stored locally in your browser
- Only the text content is sent to OpenRouter for AI analysis
- No personal data is stored on external servers
- You can export and delete your data at any time

## Project Structure

```
resumix/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Core services and store
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── public/             # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
