import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import API_BASE_URL, { prepareHeadersWithAuth } from "../../config/api";

const COURSE_API = `${API_BASE_URL}/api/v1/course/`;

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_API,
    credentials: "include",
    prepareHeaders: prepareHeadersWithAuth,
  }),
  tagTypes: ["Courses", "Course", "CreatorCourses"],
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      transformResponse: (response, meta, arg) => {
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error("Error fetching courses:", response);
        return [];
      },
      providesTags: ["Courses"],
    }),
    getCreatorCourses: builder.query({
      query: () => ({
        url: "/creator",
        method: "GET",
      }),
      transformResponse: (response) => {
        if (response?.courses) {
          return response;
        }
        return { courses: [] };
      },
      transformErrorResponse: () => ({ courses: [] }),
      providesTags: ["CreatorCourses"],
    }),
    getCoursesWithFilter: builder.query({
      query: ({ category = "", difficulty = "", search = "" }) => {
        const queryParams = new URLSearchParams();
        if (category) queryParams.append("category", category);
        if (difficulty) queryParams.append("difficulty", difficulty);
        if (search) queryParams.append("search", search);

        return {
          url: `/?${queryParams}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      transformErrorResponse: () => [],
      providesTags: ["Courses"],
    }),
    getCourse: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (response?.course) {
          return response.course;
        }
        return null;
      },
      providesTags: ["Course"],
    }),
    createCourse: builder.mutation({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Courses", "CreatorCourses"],
    }),
    updateCourse: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Courses", "Course", "CreatorCourses"],
    }),
    togglePublishStatus: builder.mutation({
      query: ({ courseId, publish }) => ({
        url: `/${courseId}`,
        method: "PATCH",
        params: { publish: publish.toString() },
      }),
      invalidatesTags: ["Courses", "Course", "CreatorCourses"],
    }),
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses", "CreatorCourses"],
    }),

    // Lecture Endpoints
    getLectures: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/lecture`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (response?.lectures) {
          return response.lectures;
        }
        return [];
      },
      providesTags: (result, error, id) => [{ type: "Lectures", id }],
    }),
    createLecture: builder.mutation({
      query: ({ courseId, formData }) => ({
        url: `/${courseId}/lecture`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Course", "Courses", "CreatorCourses"],
    }),
    getLecture: builder.query({
      query: ({ courseId, lectureId }) => ({
        url: `/lecture/${lectureId}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (response?.lecture) {
          return response.lecture;
        }
        return null;
      },
    }),
    updateLecture: builder.mutation({
      query: ({ courseId, lectureId, formData }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Course", "Courses", "CreatorCourses"],
    }),
    deleteLecture: builder.mutation({
      query: ({ lectureId }) => ({
        url: `/lecture/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course", "Courses", "CreatorCourses"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCoursesWithFilterQuery,
  useGetCourseQuery,
  useGetCreatorCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useTogglePublishStatusMutation,
  useDeleteCourseMutation,
  useGetLecturesQuery,
  useCreateLectureMutation,
  useGetLectureQuery,
  useUpdateLectureMutation,
  useDeleteLectureMutation,
} = courseApi;
