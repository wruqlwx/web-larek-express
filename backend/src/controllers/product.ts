import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { FlattenMaps, Types } from 'mongoose';
import ProductModel from '../models/product';
import UserModel from '../models/user';
import BadRequestError from '../errors/bad-request';
import ConflictError from '../errors/conflict';
import NotFoundError from '../errors/not-found';
import {
  IOrderCreate,
  IOrderRequest,
  IOrderResult,
  IOrderShort,
} from '../interfaces/order';
import { IProduct, ProductCreate, ProductUpdate } from '../interfaces/product';
import { moveUploadedFile } from '../utils/file';

const getProductOr404 = async (id: string) => {
  const product = await ProductModel.findById(id);
  if (!product) {
    throw new NotFoundError('Товар с переданным _id не найден');
  }
  return product;
};

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await ProductModel.find().lean();
    res.json({ items: products, total: products.length });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await getProductOr404(req.params.productId);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const buildProduct = async (body: ProductCreate, productId?: string) => {
  moveUploadedFile(body.image?.fileName);

  const product = productId
    ? await ProductModel.create({ ...body, _id: new Types.ObjectId(productId) })
    : await ProductModel.create(body);

  return product;
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await buildProduct(req.body as ProductCreate);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const createProductWithId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params as { productId: string };

    const occupied = await ProductModel.exists({ _id: productId });
    if (occupied) {
      throw new ConflictError('Товар с таким _id уже существует');
    }

    const product = await buildProduct(req.body as ProductCreate, productId);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as ProductUpdate;
    const { productId } = req.params;

    await getProductOr404(productId);

    if (body.image?.fileName) {
      moveUploadedFile(body.image.fileName);
    }

    const product = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: body },
      { new: true, runValidators: true },
    );

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.productId);
    if (!product) {
      throw new NotFoundError('Товар с переданным _id не найден');
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const loadPricedProducts = async (ids: string[]) => {
  const objectIds = ids.map((id) => new Types.ObjectId(id));
  const products = await ProductModel.find({ _id: { $in: objectIds } }).lean();

  if (products.length !== new Set(ids).size) {
    throw new BadRequestError('Переданные товары не найдены');
  }

  const hasUnpriced = products
    .some((product) => product.price === null || product.price === undefined);
  if (hasUnpriced) {
    throw new BadRequestError('Один из товаров не продаётся: у него не указана цена');
  }

  return products as (FlattenMaps<IProduct> & { price: number })[];
};

const createOrderForUser = async (req: Request) => {
  const { userId, items, comment } = req.body as IOrderCreate;
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new BadRequestError('Пользователь с переданным _id не найден');
  }

  const products = await loadPricedProducts(items.map((item) => item.productId));
  const prices = new Map(products.map((product) => [String(product._id), product.price]));

  const totalPrice = items.reduce(
    (acc, item) => acc + prices.get(item.productId)! * item.quantity,
    0,
  );

  const result: IOrderResult = {
    orderNo: randomUUID(),
    totalPrice,
    comment: comment ?? null,
  };

  user.orders.push({ _id: result.orderNo, totalPrice, comment: result.comment });
  await user.save();

  return result;
};

const createOrderCheckout = async (req: Request) => {
  const { items, total } = req.body as IOrderRequest;
  const products = await loadPricedProducts(items);
  const sum = products.reduce((acc, product) => acc + product.price, 0);

  if (sum !== total) {
    throw new BadRequestError('Общая сумма заказа не совпадает с суммой стоимостей товаров');
  }

  const result: IOrderShort = { id: randomUUID(), total: sum };
  return result;
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.userId) {
      res.status(201).json(await createOrderForUser(req));
      return;
    }
    res.json(await createOrderCheckout(req));
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await UserModel.aggregate([
      { $unwind: '$orders' },
      { $replaceRoot: { newRoot: '$orders' } },
    ]);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    next(error);
  }
};
