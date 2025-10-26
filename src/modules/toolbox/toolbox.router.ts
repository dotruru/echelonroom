import { Router } from 'express';
import { getMyToolbox, saveMyToolbox } from './toolbox.controller';

const router = Router();

router.get('/', getMyToolbox);
router.put('/', saveMyToolbox);

export default router;
