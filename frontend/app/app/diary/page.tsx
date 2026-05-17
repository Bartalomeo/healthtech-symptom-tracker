'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { SymptomForm } from '../../components/SymptomForm';
import { SymptomList } from '../../components/SymptomList';
import { TriggerAnalysis } from '../../components/TriggerAnalysis';

export default function DiaryPage() {
  const { data: session, status } = useSession();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSymptomSubmit = async () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to track your symptoms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">HealthTech</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user?.email}</span>
            <a href="/app/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Symptom Diary</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <SymptomForm onSubmit={handleSymptomSubmit} />
          </div>
          <div className="space-y-6">
            <SymptomList refreshTrigger={refreshTrigger} />
          </div>
        </div>

        <div className="mt-8">
          <TriggerAnalysis symptoms={[]} />
        </div>
      </main>
    </div>
  );
}