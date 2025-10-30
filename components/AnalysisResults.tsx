'use client';

import React from 'react';
import { AnalysisResult } from '@/types';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, Target, Award } from 'lucide-react';
import { clsx } from 'clsx';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  className?: string;
}

export function AnalysisResults({ analysis, className }: AnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const ScoreCircle = ({ score, label, icon: Icon }: { score: number; label: string; icon: React.ElementType }) => (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200">
      <div className={clsx('w-16 h-16 rounded-full flex items-center justify-center mb-2', getScoreBgColor(score))}>
        <Icon className={clsx('h-8 w-8', getScoreColor(score))} />
      </div>
      <div className={clsx('text-2xl font-bold', getScoreColor(score))}>
        {score}%
      </div>
      <div className="text-sm text-gray-600 text-center">{label}</div>
    </div>
  );

  const Section = ({ title, icon: Icon, children, color = 'blue' }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    color?: 'blue' | 'green' | 'red' | 'yellow';
  }) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      red: 'text-red-600 bg-red-50',
      yellow: 'text-yellow-600 bg-yellow-50',
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className={clsx('flex items-center mb-4', colorClasses[color])}>
          <Icon className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="space-y-2">
          {children}
        </div>
      </div>
    );
  };

  const RecommendationList = ({ items, type = 'default' }: {
    items: string[];
    type?: 'default' | 'strength' | 'improvement';
  }) => {
    if (items.length === 0) return null;

    const getIcon = () => {
      switch (type) {
        case 'strength':
          return <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />;
        case 'improvement':
          return <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />;
        default:
          return <Target className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />;
      }
    };

    return (
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            {getIcon()}
            <span className="text-sm text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Score Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Compatibility Analysis</h2>
          <div className="text-sm text-gray-500">
            Analyzed on {new Date(analysis.analyzedAt).toLocaleDateString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ScoreCircle score={analysis.overallMatch} label="Overall Match" icon={TrendingUp} />
          <ScoreCircle score={analysis.skillsMatch} label="Skills Match" icon={Target} />
          <ScoreCircle score={analysis.experienceMatch} label="Experience Match" icon={Award} />
          <ScoreCircle score={analysis.educationMatch} label="Education Match" icon={CheckCircle} />
        </div>
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <Section title="Your Strengths" icon={CheckCircle} color="green">
          <RecommendationList items={analysis.strengths} type="strength" />
        </Section>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Section title="Recommendations" icon={Target} color="blue">
          <RecommendationList items={analysis.recommendations} />
        </Section>
      )}

      {/* Missing Skills */}
      {analysis.missingSkills.length > 0 && (
        <Section title="Missing Skills to Highlight" icon={XCircle} color="red">
          <div className="flex flex-wrap gap-2 mb-4">
            {analysis.missingSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Consider gaining experience with these skills or highlighting any transferable skills you already have.
          </p>
        </Section>
      )}

      {/* Areas for Improvement */}
      {analysis.improvements.length > 0 && (
        <Section title="Areas for Improvement" icon={AlertCircle} color="yellow">
          <RecommendationList items={analysis.improvements} type="improvement" />
        </Section>
      )}

      {/* Detailed Analysis */}
      {analysis.detailedAnalysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h3>

          {analysis.detailedAnalysis.keywordMatches.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Keyword Matches</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.detailedAnalysis.keywordMatches.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.detailedAnalysis.experienceAlignment.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Experience Alignment</h4>
              <RecommendationList items={analysis.detailedAnalysis.experienceAlignment} />
            </div>
          )}

          {analysis.detailedAnalysis.skillGaps.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Skill Gaps</h4>
              <RecommendationList items={analysis.detailedAnalysis.skillGaps} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}