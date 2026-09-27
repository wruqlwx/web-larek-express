import { Router } from 'express';
import { createOrder } from '../controllers/product';
import { orderValidation } from '../middlewares/validation';

const orderRouter = Router();

orderRouter.post('/', orderValidation, createOrder);

export default orderRouter;
