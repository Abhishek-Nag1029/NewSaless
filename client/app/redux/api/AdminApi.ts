import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api/admin", credentials: 'include' }),
    tagTypes: ["admin"],
    endpoints: (builder) => {
        return {
            getAdmin: builder.query({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET",
                    }
                },
                // providesTags: ["admin"]
            }),
            updateAdminEmail: builder.mutation({
                query: ({ id, ...patch }) => ({
                    url: `/updateEmail/${id}`,
                    method: 'PUT',
                    body: patch,
                }),
                // invalidatesTags: ["admin"]
            }),


        }
    }
})

export const { useGetAdminQuery, useUpdateAdminEmailMutation } = adminApi
