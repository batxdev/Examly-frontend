import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import API_BASE_URL from "../../config/api";

const CHEATING_API = `${API_BASE_URL}/api`;

export const cheatingApi = createApi({
  reducerPath: "cheatingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CHEATING_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    reportCheatingAttempt: builder.mutation({
      query: (data) => ({
        url: "/cheating-attempt",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useReportCheatingAttemptMutation } = cheatingApi;
