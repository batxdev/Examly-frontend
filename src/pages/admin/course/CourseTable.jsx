import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCreatorCoursesQuery } from "@/features/api/courseApi";
import { Edit } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const CourseTable = () => {
  const { data, isLoading, isError } = useGetCreatorCoursesQuery();
  const navigate = useNavigate();

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Error loading courses. Please try again.</h1>;

  const courses = data?.courses || [];
  const hasCourses = courses.length > 0;

  return (
    <div>
      <Button onClick={() => navigate(`create`)} className="mb-6">
        Create a new test
      </Button>

      {!hasCourses ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">
            You haven't created any tests yet.
          </p>
          <p className="text-sm text-gray-400">
            Create your first test to get started.
          </p>
        </div>
      ) : (
        <Table>
          <TableCaption>A list of your recent tests.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course._id}>
                <TableCell className="font-medium">
                  {course.isFree ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <>₹{course?.coursePrice || "NA"}</>
                  )}
                </TableCell>
                <TableCell>
                  {" "}
                  <Badge>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>{" "}
                </TableCell>
                <TableCell>{course.courseTitle}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`${course._id}`)}
                  >
                    <Edit />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default CourseTable;
