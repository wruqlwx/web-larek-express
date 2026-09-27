import { Schema, model } from 'mongoose';
import { IProduct, IProductImage } from '../interfaces/product';
import { deleteImageFile } from '../utils/file';

const productImageSchema = new Schema<IProductImage>({
  fileName: {
    type: String,
    default: '',
  },
  originalName: {
    type: String,
    default: '',
  },
}, { _id: false });

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    unique: true,
    required: [true, 'Поле "title" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
  },
  image: {
    type: productImageSchema,
    required: [true, 'Поле "image" должно быть заполнено'],
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    default: null,
  },
});

productSchema.post('findOneAndDelete', (doc) => {
  if (doc?.image?.fileName) {
    deleteImageFile(doc.image.fileName);
  }
});

export default model<IProduct>('product', productSchema);
