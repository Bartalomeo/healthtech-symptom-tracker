'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ReportsPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to view reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">HealthTech</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user?.email}</span>
            <Link href="/app/diary" className="text-sm text-blue-600 hover:underline">Diary</Link>
            <Link href="/app/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Health Reports</h1>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-4">Summary Report</h2>
          <p className="text-gray-500 mb-4">
            Generate a comprehensive summary of your symptoms and triggers.
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Generate Report
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-2">Weekly Summary</h3>
            <p className="text-sm text-gray-500 mb-4">Overview of this week's symptoms</p>
            <span className="text-sm text-gray-400">No data available</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-2">Monthly Summary</h3>
            <p className="text-sm text-gray-500 mb-4">Comprehensive monthly analysis</p>
            <span className="text-sm text-gray-400">Not enough data</span>
          </div>
        </div>
      </main>
    </div>
  );
}