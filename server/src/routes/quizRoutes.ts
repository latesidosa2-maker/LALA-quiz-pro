import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/attempts', QuizController.submitAttempt);
router.get('/attempts/:attemptId', QuizController.getAttemptDetail);
router.get('/dashboard', QuizController.getDashboardSummary);

export default router;
