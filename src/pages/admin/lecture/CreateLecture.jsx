import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateLectureMutation,
  useGetLecturesQuery,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Lecture from "./Lecture";

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();

  const [createLecture, { isLoading, isSuccess, error }] =
    useCreateLectureMutation();

  const {
    data: lectures,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch,
  } = useGetLecturesQuery(courseId);

  const createLectureHandler = async () => {
    if (!lectureTitle.trim()) {
      toast.error("Please enter a lecture title");
      return;
    }

    await createLecture({
      courseId,
      formData: { lectureTitle },
    });
  };

  useEffect(() => {
    if (isSuccess) {
      refetch();
      setLectureTitle(""); // Clear input after success
      toast.success("Lecture created successfully");
    }
    if (error) {
      const errorMessage = error.data?.message || "Failed to create lecture";
      toast.error(errorMessage);
    }
  }, [isSuccess, error, refetch]);

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Let's add lectures, add some basic details for your new lecture
        </h1>
        <p className="text-sm">
          Create individual lecture items for your test content
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="Your Title Name"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/course/${courseId}`)}
          >
            Back to course
          </Button>
          <Button disabled={isLoading} onClick={createLectureHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Create lecture"
            )}
          </Button>
        </div>
        <div className="mt-10">
          {lectureLoading ? (
            <p>Loading lectures...</p>
          ) : lectureError ? (
            <p>Failed to load lectures.</p>
          ) : !lectures || lectures.length === 0 ? (
            <p>No lectures available</p>
          ) : (
            lectures.map((lecture, index) => (
              <Lecture
                key={lecture._id}
                lecture={lecture}
                courseId={courseId}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;
