import { Router } from 'express';
import authRouter from './auth';
import orderRouter from './order';
import productRouter from './product';
import uploadRouter from './upload';
import auth from '../middlewares/auth';
import { getOrders, getUsers } from '../controllers/product';

const router = Router();

router.use('/product', productRouter);
router.use('/order', orderRouter);
router.use('/upload', uploadRouter);
router.use('/auth', authRouter);
router.get('/users', auth, getUsers);
router.get('/orders', auth, getOrders);

export default router;
