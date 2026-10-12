import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  UploadTransactionsRequest,
  ImportTransactionsResult,
  Transaction,
} from "../types/transaction";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5074/api/",
  }),
  tagTypes: ["Transaction"],
  endpoints: (builder) => ({
    getTransactions: builder.query<Transaction[], void>({
      query: () => "/transactions",
      providesTags: ["Transaction"],
    }),

    addTransaction: builder.mutation<Transaction, CreateTransactionRequest>({
      query: (body) => ({
        url: "transactions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transaction"],
    }),

    updateTransaction: builder.mutation<Transaction, UpdateTransactionRequest>({
      query: ({ id, ...body }) => ({
        url: `transactions/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Transaction"],
    }),

    deleteTransaction: builder.mutation<void, string>({
      query: (id) => ({
        url: `transactions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transaction"],
    }),

    uploadTransactions: builder.mutation<
      ImportTransactionsResult,
      UploadTransactionsRequest
    >({
      query: ({ file, confirmImport = false, excludedIndexes = [] }) => {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("confirmImport", String(confirmImport));

        excludedIndexes.forEach((index) => {
          formData.append("excludedIndexes", String(index));
        });

        return {
          url: "transactions/upload",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Transaction"],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useUploadTransactionsMutation,
} = api;
