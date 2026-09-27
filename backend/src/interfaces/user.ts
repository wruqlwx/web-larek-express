export interface IRefreshToken {
  token: string;
}

export interface ITokenPayload {
  _id: string;
}

export interface IUserOrder {
  _id: string;
  totalPrice: number;
  comment: string | null;
}

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  password?: string;
  tokens?: IRefreshToken[];
  orders: IUserOrder[];
}

export interface IUserPublic {
  email: string;
  name?: string;
}

export interface ILoginDto {
  email: string;
  password: string;
}

export interface IRegisterDto {
  name?: string;
  email: string;
  password: string;
}
