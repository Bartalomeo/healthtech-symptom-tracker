'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Symptom {
  id: string;
  name: string;
  severity: number;
  triggers: string[];
  notes: string;
  recorded_at: string;
}

interface SymptomListProps {
  refreshTrigger?: number;
}

export function SymptomList({ refreshTrigger = 0 }: SymptomListProps) {
  const { data: session } = useSession();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchSymptoms();
    }
  }, [session, refreshTrigger]);

  const fetchSymptoms = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/symptoms`, {
        headers: {
          'Authorization': `Bearer ${(session as any).accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSymptoms(data);
      }
    } catch (error) {
      console.error('Error fetching symptoms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSymptom = async (id: string) => {
    if (!session) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/symptoms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(session as any).accessToken}`,
        },
      });
      
      if (response.ok) {
        setSymptoms(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting symptom:', error);
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'text-green-600 bg-green-50';
    if (severity <= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!session) {
    return <p className="text-gray-500 text-center py-8">Please sign in to view your symptoms.</p>;
  }

  if (isLoading) {
    return <p className="text-gray-500 text-center py-8">Loading symptoms...</p>;
  }

  if (symptoms.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <p className="text-gray-500 mb-2">No symptoms recorded yet</p>
        <p className="text-sm text-gray-400">Start tracking by adding your first symptom above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <h2 className="text-xl font-semibold p-4 border-b border-gray-100">Recent Symptoms</h2>
      <div className="divide-y divide-gray-100">
        {symptoms.map(symptom => (
          <div key={symptom.id} className="p-4 hover:bg-gray-50 transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium text-gray-900">{symptom.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(symptom.severity)}`}>
                    {symptom.severity}/10
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{formatDate(symptom.recorded_at)}</p>
                {symptom.triggers && symptom.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {symptom.triggers.map((trigger, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {trigger}
                      </span>
                    ))}
                  </div>
                )}
                {symptom.notes && (
                  <p className="text-sm text-gray-600">{symptom.notes}</p>
                )}
              </div>
              <button
                onClick={() => deleteSymptom(symptom.id)}
                className="text-gray-400 hover:text-red-600 transition p-1"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}