import { Schema, model } from 'mongoose';
import isEmail from 'validator/lib/isEmail';
import { IRefreshToken, IUser, IUserOrder } from '../interfaces/user';

const tokenSchema = new Schema<IRefreshToken>({
  token: {
    type: String,
    required: true,
  },
}, { _id: false });

const orderSchema = new Schema<IUserOrder>({
  _id: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    default: null,
  },
}, { _id: false });

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: [true, 'Поле "email" должно быть заполнено'],
    unique: true,
    validate: [(value: string) => isEmail(value), 'Некорректный email'],
  },
  password: {
    type: String,
    required: [true, 'Поле "password" должно быть заполнено'],
    select: false,
  },
  tokens: {
    type: [tokenSchema],
    default: [],
    select: false,
  },
  orders: {
    type: [orderSchema],
    default: [],
  },
});

export default model<IUser>('user', userSchema);
