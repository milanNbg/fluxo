import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { HealthCheckResponse } from '@fluxo/shared';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
    credentials: 'include',
  }),
  tagTypes: ['Health', 'User', 'Transaction'],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthCheckResponse, void>({
      query: () => '/health',
      providesTags: ['Health'],
    }),
  }),
});

export const { useGetHealthQuery } = api;