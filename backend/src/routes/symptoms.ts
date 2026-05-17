import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';

const router = Router();

// GET /api/symptoms - list user symptoms
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { query } = await import('../lib/db');
    const result = await query(
      'SELECT * FROM symptoms WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 100',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    res.status(500).json({ error: 'Failed to fetch symptoms' });
  }
});

// POST /api/symptoms - create symptom
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, severity, triggers, notes, recorded_at } = req.body;
    const { query } = await import('../lib/db');
    
    const result = await query(
      `INSERT INTO symptoms (user_id, name, severity, triggers, notes, recorded_at) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, name, severity || 5, JSON.stringify(triggers || []), notes, recorded_at || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating symptom:', error);
    res.status(500).json({ error: 'Failed to create symptom' });
  }
});

// GET /api/symptoms/:id - get single symptom
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { query } = await import('../lib/db');
    
    const result = await query(
      'SELECT * FROM symptoms WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Symptom not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching symptom:', error);
    res.status(500).json({ error: 'Failed to fetch symptom' });
  }
});

// PUT /api/symptoms/:id - update symptom
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name, severity, triggers, notes, recorded_at } = req.body;
    const { query } = await import('../lib/db');
    
    const result = await query(
      `UPDATE symptoms 
       SET name = COALESCE($1, name), 
           severity = COALESCE($2, severity), 
           triggers = COALESCE($3, triggers), 
           notes = COALESCE($4, notes),
           recorded_at = COALESCE($5, recorded_at)
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, severity, triggers ? JSON.stringify(triggers) : null, notes, recorded_at, id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Symptom not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating symptom:', error);
    res.status(500).json({ error: 'Failed to update symptom' });
  }
});

// DELETE /api/symptoms/:id - delete symptom
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { query } = await import('../lib/db');
    
    const result = await query(
      'DELETE FROM symptoms WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Symptom not found' });
    }
    res.json({ message: 'Symptom deleted successfully' });
  } catch (error) {
    console.error('Error deleting symptom:', error);
    res.status(500).json({ error: 'Failed to delete symptom' });
  }
});

export default router;