import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5074/api/",
  }),
  endpoints: (builder) => ({
    test: builder.query<string, void>({
      query: () => "transactions/test",
    }),
  }),
});

export const { useTestQuery } = api;