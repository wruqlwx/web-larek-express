import { celebrate } from 'celebrate';
import Joi from 'joi';
import isEmail from 'validator/lib/isEmail';

const objectId = () => Joi.string().pattern(/^[0-9a-fA-F]{24}$/, { name: 'идентификатор' });

const validEmail = (value: string, helpers: Joi.CustomHelpers) => (
  isEmail(value) ? value : helpers.error('any.invalid')
);

const productImage = Joi.object({
  fileName: Joi.string().allow('').required(),
  originalName: Joi.string().allow('').required(),
});

export const productBodySchema = Joi.object({
  title: Joi.string().min(2).max(30).required(),
  image: productImage.required(),
  category: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().allow(null).default(null),
});

export const productPatchSchema = Joi.object({
  title: Joi.string().min(2).max(30).optional(),
  image: productImage.optional(),
  category: Joi.string().optional(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().allow(null).optional(),
});

export const productIdParamsSchema = Joi.object({
  productId: objectId().required(),
});

export const productValidation = celebrate({ body: productBodySchema });
export const productPatchValidation = celebrate({
  params: productIdParamsSchema,
  body: productPatchSchema,
});
export const productIdValidation = celebrate({ params: productIdParamsSchema });

export const orderValidation = celebrate({
  body: Joi.alternatives().try(
    Joi.object({
      payment: Joi.string().valid('card', 'cash', 'online').required(),
      email: Joi.string().trim().required().custom(validEmail),
      phone: Joi.string().trim().required(),
      address: Joi.string().trim().required(),
      total: Joi.number().required(),
      items: Joi.array().items(objectId()).min(1).required(),
    }),
    Joi.object({
      userId: objectId().required(),
      items: Joi.array().items(
        Joi.object({
          productId: objectId().required(),
          quantity: Joi.number().integer().min(1).required(),
        }),
      ).min(1).required(),
      comment: Joi.string().allow('', null).optional(),
    }),
  ).messages({ 'alternatives.any': 'Неверные данные заказа' }),
});

export const loginValidation = celebrate({
  body: Joi.object({
    email: Joi.string().trim().required(),
    password: Joi.string().required(),
  }),
});

export const registerValidation = celebrate({
  body: Joi.object({
    name: Joi.string().min(2).max(30).optional(),
    email: Joi.string().trim().required().custom(validEmail),
    password: Joi.string().min(6).required(),
  }),
});
