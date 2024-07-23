import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const employeeApi = createApi({
    reducerPath: "employeeApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api/employee", credentials: 'include' }),
    tagTypes: ["employee"],
    endpoints: (builder) => {
        return {
            getEmployee: builder.query({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET",
                    }
                },
                // providesTags: ["employee"]
            }),
            updateEmployeeEmail: builder.mutation({
                query: ({ id, ...patch }) => ({
                    url: `/updateEmail/${id}`,
                    method: 'PUT',
                    body: patch,
                }),
                // invalidatesTags: ["employee"]
            }),



        }
    }
})

export const { useGetEmployeeQuery, useUpdateEmployeeEmailMutation } = employeeApi

