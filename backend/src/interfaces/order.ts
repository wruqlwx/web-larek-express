export interface IOrderItem {
  productId: string;
  quantity: number;
}

export interface IOrderCreate {
  userId: string;
  items: IOrderItem[];
  comment?: string | null;
}

export interface IOrderResult {
  orderNo: string;
  totalPrice: number;
  comment: string | null;
}

export interface IOrderShort {
  id: string;
  total: number;
}

export interface IOrderRequest {
  items: string[];
  total: number;
}
