'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to view your dashboard.</p>
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
            <Link href="/app/reports" className="text-sm text-blue-600 hover:underline">Reports</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">This Week</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">symptoms logged</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Top Trigger</h3>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-500">most common trigger</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Avg Severity</h3>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-500">last 7 days</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/app/diary" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              <h3 className="font-medium text-blue-900">Log Symptom</h3>
              <p className="text-sm text-blue-700">Record a new symptom entry</p>
            </Link>
            <Link href="/app/reports" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <h3 className="font-medium text-green-900">View Reports</h3>
              <p className="text-sm text-green-700">Generate health reports</p>
            </Link>
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-left">
              <h3 className="font-medium text-purple-900">Analyze Patterns</h3>
              <p className="text-sm text-purple-700">AI-powered trigger analysis</p>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Recent Insights</h2>
          <p className="text-gray-500 text-center py-8">
            Not enough data yet. Keep logging symptoms to get personalized insights.
          </p>
        </div>
      </main>
    </div>
  );
}