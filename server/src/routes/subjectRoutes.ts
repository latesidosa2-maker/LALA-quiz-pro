import { Router } from 'express';
import { SubjectController } from '../controllers/SubjectController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', SubjectController.getSubjects);
router.get('/:subjectId/units/:unitId', SubjectController.getUnitDetails);
router.post('/', isAdmin, SubjectController.createSubject);
router.post('/:subjectId/units', isAdmin, SubjectController.addUnit);

export default router;
