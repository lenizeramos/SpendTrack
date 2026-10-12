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

export type ImportTransactionsResult = {
  requiresConfirmation: boolean;
  message: string;
  duplicates: DuplicateTransaction[];
  importedCount: number;
  skippedCount: number;
  totalCount: number;
};

export type DuplicateTransaction = {
  index: number;
  transaction: Transaction;
  reason: string;
};

export type UploadTransactionsRequest = {
  file: File;
  confirmImport?: boolean;
  excludedIndexes?: number[];
};