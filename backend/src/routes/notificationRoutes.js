import { Router } from 'express';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.post('/test-email', authenticate, allowRoles('admin'), asyncHandler(async (req, res) => {
  const to = req.body.to || req.user.email;
  const result = await sendEmail({ to, subject: 'MediCore email configuration test', text: 'Your MediCore email configuration is working.' });
  res.json({ message: result.skipped ? 'SMTP is not configured; email was skipped.' : 'Test email sent.' });
}));
export default router;
