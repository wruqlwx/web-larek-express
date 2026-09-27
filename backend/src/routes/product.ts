import { Router } from 'express';
import {
  createProduct,
  createProductWithId,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/product';
import auth from '../middlewares/auth';
import {
  productIdValidation,
  productPatchValidation,
  productValidation,
} from '../middlewares/validation';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/:productId', productIdValidation, getProduct);
productRouter.post('/', productValidation, createProduct);
productRouter.post('/:productId', auth, productIdValidation, productValidation, createProductWithId);
productRouter.patch('/:productId', auth, productPatchValidation, updateProduct);
productRouter.delete('/:productId', auth, productIdValidation, deleteProduct);

export default productRouter;
