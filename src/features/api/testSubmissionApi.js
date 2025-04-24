import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import API_BASE_URL, { prepareHeadersWithAuth } from "../../config/api";

export const testSubmissionApi = createApi({
  reducerPath: "testSubmissionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: prepareHeadersWithAuth,
  }),
  tagTypes: ["TestSubmissions"],
  endpoints: (builder) => ({
    getStudentTestSubmissions: builder.query({
      query: () => ({
        url: "/api/v1/tests/my-submissions",
        method: "GET",
      }),
      providesTags: ["TestSubmissions"],
    }),
  }),
});

export const { useGetStudentTestSubmissionsQuery } = testSubmissionApi;
