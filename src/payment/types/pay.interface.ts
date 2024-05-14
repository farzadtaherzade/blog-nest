export interface PayOption {
  api: string;
  amount: number;
  description: string;
  redirect: string;
  mobile?: string;
  factorNumber: string;
}

export interface PayResponse {
  status: number;
  token: string;
}

export interface PayVerifyResponse {
  status?: number;
  transId?: number;
  factorNumber?: string;
  mobile?: string;
  description?: string;
  cardNumber?: string;
  message?: string;
}
