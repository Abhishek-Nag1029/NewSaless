"use client"
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const loginApi = createApi({
  reducerPath: 'loginApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://newsaless-2.onrender.com/api', credentials: 'include'
  }),
  endpoints: (builder) => ({

    adminLogin: builder.mutation({
      query: (userData) => ({
        url: '/admin/login',
        method: 'POST',
        body: userData
      })
    }),

    employeeLogin: builder.mutation({
      query: (userData) => ({
        url: '/employee/login',
        method: 'POST',
        body: userData
      })
    })
  })
});

export const { useEmployeeLoginMutation, useAdminLoginMutation } = loginApi
