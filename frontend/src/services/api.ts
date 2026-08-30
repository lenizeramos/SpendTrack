import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { CreateTransactionRequest, Transaction } from "../types/transaction";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5074/api/",
  }),
  endpoints: (builder) => ({
    test: builder.query<string, void>({
      query: () => "transactions/test",
    }),

    addTransaction: builder.mutation<Transaction, CreateTransactionRequest >({
      query: (body) => ({
        url: "transactions",
        method: "POST",
        body,
      }),
    }),

    uploadTransactions: builder.mutation<any, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "transactions/upload",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const { useTestQuery, useAddTransactionMutation, useUploadTransactionsMutation, } = api;