export interface IProductImage {
  fileName: string;
  originalName: string;
}

export interface IProduct {
  _id: string;
  title: string;
  image: IProductImage;
  category: string;
  description?: string;
  price?: number | null;
}

export type ProductCreate = Omit<IProduct, '_id'>;
export type ProductUpdate = Partial<ProductCreate>;
