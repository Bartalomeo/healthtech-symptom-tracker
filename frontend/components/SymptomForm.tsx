'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface SymptomFormProps {
  onSubmit?: (data: any) => Promise<void>;
}

export function SymptomForm({ onSubmit }: SymptomFormProps) {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState(5);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerOptions = ['stress', 'lack of sleep', 'food', 'exercise', 'weather', 'alcohol', 'caffeine', 'dehydration'];

  const handleTriggerToggle = (trigger: string) => {
    setTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any).accessToken}`,
        },
        body: JSON.stringify({
          name,
          severity,
          triggers,
          notes,
          recorded_at: recordedAt,
        }),
      });
      
      if (response.ok) {
        setName('');
        setSeverity(5);
        setTriggers([]);
        setNotes('');
        setRecordedAt(new Date().toISOString().split('T')[0]);
        if (onSubmit) await onSubmit();
      }
    } catch (error) {
      console.error('Error submitting symptom:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Log New Symptom</h2>
      
      {/* Symptom Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Symptom Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Headache, Fatigue, Nausea"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Date Picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={recordedAt}
          onChange={(e) => setRecordedAt(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Severity Slider */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Severity: {severity}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={severity}
          onChange={(e) => setSeverity(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Mild</span>
          <span>Severe</span>
        </div>
      </div>

      {/* Triggers */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Possible Triggers</label>
        <div className="flex flex-wrap gap-2">
          {triggerOptions.map(trigger => (
            <button
              key={trigger}
              type="button"
              onClick={() => handleTriggerToggle(trigger)}
              className={`px-3 py-1 rounded-full text-sm ${
                triggers.includes(trigger)
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {trigger}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !session}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : 'Save Symptom'}
      </button>
    </form>
  );
}