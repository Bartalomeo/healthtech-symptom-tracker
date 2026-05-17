'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface TriggerAnalysisProps {
  symptoms: any[];
}

interface Pattern {
  trigger: string;
  confidence: number;
  description: string;
  associatedSymptoms: string[];
}

export function TriggerAnalysis({ symptoms }: TriggerAnalysisProps) {
  const { data: session } = useSession();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const analyzePatterns = async () => {
    if (!session || symptoms.length === 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patterns/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any).accessToken}`,
        },
        body: JSON.stringify({ symptoms }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPatterns(data);
        setHasAnalyzed(true);
      }
    } catch (error) {
      console.error('Error analyzing patterns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'bg-green-100 text-green-800';
    if (confidence >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Trigger Analysis</h2>
        <button
          onClick={analyzePatterns}
          disabled={isLoading || symptoms.length === 0 || !session}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Patterns'}
        </button>
      </div>

      {symptoms.length === 0 && (
        <p className="text-gray-500 text-sm">Add some symptoms to analyze trigger patterns.</p>
      )}

      {hasAnalyzed && patterns.length === 0 && (
        <p className="text-gray-500 text-sm">No significant patterns found. Keep logging symptoms for better analysis.</p>
      )}

      {patterns.length > 0 && (
        <div className="space-y-4">
          {patterns.map((pattern, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{pattern.trigger}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getConfidenceColor(pattern.confidence)}`}>
                  {Math.round(pattern.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
              <div className="flex flex-wrap gap-1">
                {pattern.associatedSymptoms.map((symptom, j) => (
                  <span key={j} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}