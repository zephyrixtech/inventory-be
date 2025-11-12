import { Router } from 'express';
import { body, param } from 'express-validator';

import { listStores, createStore, updateStore, deleteStore } from '../controllers/store.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate-request';

const router = Router();

router.use(authenticate, authorize(['manage_stores']));

router.get('/', listStores);

router.post(
  '/',
  [body('name').notEmpty(), body('code').notEmpty(), body('managerId').optional().isMongoId()],
  validateRequest,
  createStore
);

router.put('/:id', [param('id').isMongoId(), body('managerId').optional().isMongoId()], validateRequest, updateStore);

router.delete('/:id', [param('id').isMongoId()], validateRequest, deleteStore);

export default router;

