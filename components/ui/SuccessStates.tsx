import { CheckCircle, TrendingUp } from 'lucide-react';

export function UploadSuccessState({ onViewAnalysis }: { onViewAnalysis: () => void }) {
  return (
    <div className="text-center py-12">
      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Resume Uploaded
      </h3>
      <p className="text-gray-600 mb-6">
        Ready to analyze job matches
      </p>
      <button
        onClick={onViewAnalysis}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        Find Jobs
      </button>
    </div>
  );
}

export function AnalysisSuccessState({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="text-center py-12">
      <TrendingUp className={`w-16 h-16 ${getScoreColor(score)} mx-auto mb-4`} />
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {score}% Match
      </h3>
      <p className="text-gray-600">
        Analysis complete
      </p>
    </div>
  );
}