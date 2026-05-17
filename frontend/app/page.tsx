import { NextPage } from 'next';
import Link from 'next/link';

const HomePage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="py-6 px-8 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">HealthTech</div>
        <nav className="flex gap-6">
          <Link href="/app/diary" className="text-gray-600 hover:text-blue-600">Diary</Link>
          <Link href="/app/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
          <Link href="/app/reports" className="text-gray-600 hover:text-blue-600">Reports</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="px-8 py-20 max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Track Your Health,<br />
          <span className="text-blue-600">Understand Your Body</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl">
          Monitor symptoms, identify patterns, and get AI-powered insights to better understand your health triggers.
        </p>
        
        <Link 
          href="/app/diary"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          Start Tracking
        </Link>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Symptom Logging</h3>
            <p className="text-gray-600">Record symptoms with severity, triggers, and notes. Easy daily tracking.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Pattern Detection</h3>
            <p className="text-gray-600">AI analyzes your data to find correlations between triggers and symptoms.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Health Reports</h3>
            <p className="text-gray-600">Generate comprehensive reports and insights to share with your doctor.</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
              <p className="text-gray-600">Log symptoms daily</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
              <p className="text-gray-600">Track triggers</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
              <p className="text-gray-600">AI finds patterns</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">4</div>
              <p className="text-gray-600">Get insights</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 border-t border-gray-200 mt-20">
        <p>HealthTech Symptom Tracker - Your health, your data, your insights</p>
      </footer>
    </div>
  );
};

export default HomePage;