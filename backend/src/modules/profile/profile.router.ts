import { Router } from 'express';
import { getMyProfile, saveMyProfile } from './profile.controller';

const router = Router();

router.get('/me', getMyProfile);
router.put('/me', saveMyProfile);

export default router;
