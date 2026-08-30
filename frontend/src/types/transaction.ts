export type Transaction = {
  id: string;
  description: string;
};

export type CreateTransactionRequest = {
  description: string;
};