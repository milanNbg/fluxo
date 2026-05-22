import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import type {
  HealthCheckResponse,
  AuthResponse,
  MeResponse,
  RegisterUserInput,
  LoginUserInput,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionListResponse,
  TransactionFilters,
  TransactionStats,
  BudgetListResponse,
  BudgetWithStats,
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetFilters,
  GoalWithStats,
  CreateGoalInput,
  UpdateGoalInput,
  CreateContributionInput,
} from '@fluxo/shared';
import { setCredentials, clearCredentials } from '@/features/auth/authSlice';
import type { RootState } from './store';

export interface SuggestionsResponse {
  questions: string[];
}

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  baseApi,
  extraOptions,
) => {
  await mutex.waitForUnlock();

  let result = await baseQuery(args, baseApi, extraOptions);

  const isAuthEndpoint =
    typeof args !== 'string' &&
    typeof args.url === 'string' &&
    (args.url.includes('/auth/login') ||
      args.url.includes('/auth/register') ||
      args.url.includes('/auth/refresh'));

  if (result.error?.status === 401 && !isAuthEndpoint) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST' },
          baseApi,
          extraOptions,
        );

        if (refreshResult.data) {
          const data = refreshResult.data as AuthResponse;
          baseApi.dispatch(
            setCredentials({
              user: data.user,
              accessToken: data.tokens.accessToken,
            }),
          );

          result = await baseQuery(args, baseApi, extraOptions);
        } else {
          baseApi.dispatch(clearCredentials());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, baseApi, extraOptions);
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Health', 'User', 'Transaction', 'Category', 'Budget', 'Goal'],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthCheckResponse, void>({
      query: () => '/health',
      providesTags: ['Health'],
    }),

    register: builder.mutation<AuthResponse, RegisterUserInput>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          dispatch(api.util.resetApiState());
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: data.user,
              accessToken: data.tokens.accessToken,
            }),
          );
        } catch {
          // Error handling done in component
        }
      },
    }),

    login: builder.mutation<AuthResponse, LoginUserInput>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          dispatch(api.util.resetApiState());
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: data.user,
              accessToken: data.tokens.accessToken,
            }),
          );
        } catch {
          // Error handling done in component
        }
      },
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
          dispatch(api.util.resetApiState());
        }
      },
    }),

    refresh: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),

    me: builder.query<MeResponse, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    listCategories: builder.query<{ categories: Category[] }, void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),

    createCategory: builder.mutation<{ category: Category }, CreateCategoryInput>({
      query: (input) => ({
        url: '/categories',
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['Category'],
    }),

    updateCategory: builder.mutation<
      { category: Category },
      { id: string; input: UpdateCategoryInput }
    >({
      query: ({ id, input }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body: input,
      }),
      invalidatesTags: ['Category'],
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    getTransactionStats: builder.query<TransactionStats, void>({
      query: () => '/transactions/stats',
      providesTags: [{ type: 'Transaction', id: 'STATS' }],
    }),

    getSuggestions: builder.query<SuggestionsResponse, void>({
      query: () => '/ai/suggestions',
    }),

    listBudgets: builder.query<BudgetListResponse, BudgetFilters>({
      query: (filters) => ({
        url: '/budgets',
        params: filters,
      }),
      providesTags: ['Budget'],
    }),

    createBudget: builder.mutation<{ budget: BudgetWithStats }, CreateBudgetInput>({
      query: (input) => ({
        url: '/budgets',
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['Budget'],
    }),

    updateBudget: builder.mutation<
      { budget: BudgetWithStats },
      { id: string; input: UpdateBudgetInput }
    >({
      query: ({ id, input }) => ({
        url: `/budgets/${id}`,
        method: 'PATCH',
        body: input,
      }),
      invalidatesTags: ['Budget'],
    }),

    deleteBudget: builder.mutation<void, string>({
      query: (id) => ({
        url: `/budgets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Budget'],
    }),

    listGoals: builder.query<{ goals: GoalWithStats[] }, void>({
      query: () => '/goals',
      providesTags: ['Goal'],
    }),

    createGoal: builder.mutation<{ goal: GoalWithStats }, CreateGoalInput>({
      query: (input) => ({
        url: '/goals',
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['Goal'],
    }),

    updateGoal: builder.mutation<{ goal: GoalWithStats }, { id: string; input: UpdateGoalInput }>({
      query: ({ id, input }) => ({
        url: `/goals/${id}`,
        method: 'PATCH',
        body: input,
      }),
      invalidatesTags: ['Goal'],
    }),

    deleteGoal: builder.mutation<void, string>({
      query: (id) => ({
        url: `/goals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Goal'],
    }),

    addContribution: builder.mutation<
      { goal: GoalWithStats },
      { goalId: string; input: CreateContributionInput }
    >({
      query: ({ goalId, input }) => ({
        url: `/goals/${goalId}/contributions`,
        method: 'POST',
        body: input,
      }),
      invalidatesTags: ['Goal'],
    }),

    deleteContribution: builder.mutation<
      { goal: GoalWithStats },
      { goalId: string; contributionId: string }
    >({
      query: ({ goalId, contributionId }) => ({
        url: `/goals/${goalId}/contributions/${contributionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Goal'],
    }),

    listTransactions: builder.query<TransactionListResponse, TransactionFilters>({
      query: (filters) => ({
        url: '/transactions',
        params: filters,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.transactions.map(({ id }) => ({
                type: 'Transaction' as const,
                id,
              })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),

    createTransaction: builder.mutation<{ transaction: Transaction }, CreateTransactionInput>({
      query: (input) => ({
        url: '/transactions',
        method: 'POST',
        body: input,
      }),
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Transaction', id: 'STATS' },
      ],
    }),

    updateTransaction: builder.mutation<
      { transaction: Transaction },
      { id: string; input: UpdateTransactionInput }
    >({
      query: ({ id, input }) => ({
        url: `/transactions/${id}`,
        method: 'PATCH',
        body: input,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' },
        { type: 'Transaction', id: 'STATS' },
      ],
    }),

    deleteTransaction: builder.mutation<void, string>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Transaction', id: 'STATS' },
      ],
    }),
  }),
});

export const {
  useGetHealthQuery,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useMeQuery,
  useLazyMeQuery,
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useListTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetTransactionStatsQuery,
  useGetSuggestionsQuery,
  useListBudgetsQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
  useListGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useAddContributionMutation,
  useDeleteContributionMutation,
} = api;
