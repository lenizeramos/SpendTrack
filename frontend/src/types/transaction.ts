export type Transaction = {
  id?: string;
  date: string;
  description: string;
  amount: number;
  category: string;
};

export type CreateTransactionRequest = {
  description: string;
};