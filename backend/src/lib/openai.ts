import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

interface Symptom { id?: string; name: string; severity: number; triggers?: string[]; notes?: string; recorded_at?: string; }
interface PatternResult { trigger: string; confidence: number; description: string; associatedSymptoms: string[]; }
interface SummaryResult { totalSymptoms: number; averageSeverity: number; topTriggers: string[]; insights: string[]; recommendations: string[]; }

export async function analyzePatterns(symptoms: Symptom[]): Promise<PatternResult[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, returning mock data');
    return [{ trigger: 'stress', confidence: 0.85, description: 'High correlation between stress and headaches', associatedSymptoms: ['headache', 'fatigue'] }];
  }
  const symptomList = symptoms.map(s => `- ${s.name} (severity: ${s.severity}/10, triggers: ${s.triggers?.join(', ') || 'none'})`).join('\n');
  const prompt = `Analyze these health symptoms and identify recurring trigger patterns:\n${symptomList}\n\nReturn a JSON array of trigger patterns found. Each pattern should have: trigger, confidence (0-1), description, associatedSymptoms array. Return ONLY the JSON array.`;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });
    return JSON.parse(response.choices[0]?.message?.content || '[]');
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Failed to analyze patterns');
  }
}

export async function generateSummary(symptoms: Symptom[]): Promise<SummaryResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, returning mock summary');
    return {
      totalSymptoms: symptoms.length,
      averageSeverity: symptoms.reduce((acc, s) => acc + s.severity, 0) / symptoms.length || 0,
      topTriggers: ['stress', 'lack of sleep'],
      insights: ['Your symptoms tend to worsen in the evening', 'Headaches often preceded by stress'],
      recommendations: ['Consider stress management techniques', 'Maintain consistent sleep schedule'],
    };
  }
  const symptomList = symptoms.map(s => `- ${s.name} (severity: ${s.severity}/10)`).join('\n');
  const prompt = `Generate a health summary from these symptoms:\n${symptomList}\n\nReturn JSON: totalSymptoms, averageSeverity, topTriggers[3], insights[5], recommendations[5]. Return ONLY the JSON.`;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1500,
    });
    return JSON.parse(response.choices[0]?.message?.content || '{}');
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Failed to generate summary');
  }
}