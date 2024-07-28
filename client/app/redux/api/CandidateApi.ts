import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const candidateApi = createApi({
    reducerPath: "candidateApi",
    baseQuery: fetchBaseQuery({ baseUrl: "https://newsaless-2.onrender.com/api/candidate", credentials: 'include' }),
    tagTypes: ["candidate"],
    endpoints: (builder) => {
        return {
            getCandidate: builder.query({
                query: () => {
                    return {
                        url: "/",
                        method: "GET",
                    }
                },
                // providesTags: ["candidate"]
            })



        }
    }
})

export const { useGetCandidateQuery } = candidateApi
