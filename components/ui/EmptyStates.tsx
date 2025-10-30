import { Search, FileText, Clock } from 'lucide-react';

export function NoResumeEmptyState() {
  return (
    <div className="text-center py-12">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Resume
      </h3>
      <p className="text-gray-600">
        Upload your resume to get started
      </p>
    </div>
  );
}

export function NoJobSearchEmptyState() {
  return (
    <div className="text-center py-12">
      <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Jobs
      </h3>
      <p className="text-gray-600">
        Search for jobs to analyze
      </p>
    </div>
  );
}

export function NoAnalysisEmptyState() {
  return (
    <div className="text-center py-12">
      <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Analysis
      </h3>
      <p className="text-gray-600">
        Analyze a job to see results
      </p>
    </div>
  );
}