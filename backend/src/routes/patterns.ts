import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { analyzePatterns, generateSummary } from '../lib/openai';

const router = Router();

// POST /api/patterns/analyze - AI pattern analysis
router.post('/analyze', verifyToken, async (req: Request, res: Response) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Symptoms array required' });
    }
    
    const patterns = await analyzePatterns(symptoms);
    res.json(patterns);
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    res.status(500).json({ error: 'Failed to analyze patterns' });
  }
});

// GET /api/patterns/summary - AI summary for dashboard
router.get('/summary', verifyToken, async (req: Request, res: Response) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Symptoms array required' });
    }
    
    const summary = await generateSummary(symptoms);
    res.json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;