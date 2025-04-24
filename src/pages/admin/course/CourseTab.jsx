import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useUpdateCourseMutation,
  useGetCourseQuery,
  useTogglePublishStatusMutation,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import API_BASE_URL from "@/config/api";
import axios from "axios";

const CourseTab = () => {
  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
    isFree: false,
  });

  const params = useParams();
  const courseId = params.courseId;
  const {
    data: course,
    isLoading: courseLoading,
    refetch,
  } = useGetCourseQuery(courseId);

  const [togglePublish] = useTogglePublishStatusMutation();

  useEffect(() => {
    if (course) {
      setInput({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice || "",
        courseThumbnail: "",
        isFree: course.isFree || false,
      });
    }
  }, [course]);

  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [courseThumbnailUrl, setCourseThumbnailUrl] = useState("");
  const navigate = useNavigate();

  const [updateCourse, { isLoading, isSuccess, error }] =
    useUpdateCourseMutation();

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const selectCategory = (value) => {
    setInput({ ...input, category: value });
  };
  const selectCourseLevel = (value) => {
    setInput({ ...input, courseLevel: value });
  };
  // get file
  const selectThumbnail = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);

      try {
        setUploadingThumbnail(true);
        // Upload to Cloudinary directly
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
          `${API_BASE_URL}/api/v1/media/upload-video`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          setCourseThumbnailUrl(response.data.data.secure_url);
          toast.success("Thumbnail uploaded successfully");
        }
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
        toast.error("Failed to upload thumbnail");
      } finally {
        setUploadingThumbnail(false);
      }
    }
  };

  const updateCourseHandler = async () => {
    // Prepare data for API
    const data = {
      courseTitle: input.courseTitle,
      subTitle: input.subTitle,
      description: input.description,
      category: input.category,
      courseLevel: input.courseLevel,
      coursePrice: input.coursePrice,
      isFree: input.isFree.toString(),
    };

    // Only add thumbnail URL if it was uploaded
    if (courseThumbnailUrl) {
      data.courseThumbnailUrl = courseThumbnailUrl;
    }

    await updateCourse({ id: courseId, data });
  };

  // Toggle course published status
  const publishStatusHandler = async (action) => {
    try {
      // Use the specific toggle publish mutation
      await togglePublish({
        courseId,
        publish: action === "true",
      });

      refetch();
      toast.success(
        `Course ${action === "true" ? "published" : "unpublished"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };

  const handleFreeToggle = (checked) => {
    setInput({ ...input, isFree: checked });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Course updated successfully");
      refetch();
    }
    if (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course");
    }
  }, [isSuccess, error, refetch]);

  if (courseLoading) return <h1>Loading...</h1>;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Basic Test Information</CardTitle>
          <CardDescription>
            Make changes to your test here. Click save when you're done.
          </CardDescription>
        </div>
        <div className="space-x-2">
          <Button
            disabled={!course || course.lectures?.length === 0}
            variant="outline"
            onClick={() =>
              publishStatusHandler(course?.isPublished ? "false" : "true")
            }
          >
            {course?.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button>Remove Test</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-5">
          <div>
            <Label>Title</Label>
            <Input
              type="text"
              name="courseTitle"
              value={input.courseTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Fullstack developer"
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input
              type="text"
              name="subTitle"
              value={input.subTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Become a Fullstack developer from zero to hero in 2 months"
            />
          </div>
          <div>
            <Label>Description</Label>
            <RichTextEditor input={input} setInput={setInput} />
          </div>
          <div className="flex items-center gap-5">
            <div>
              <Label>Category</Label>
              <Select
                defaultValue={input.category}
                onValueChange={selectCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Category</SelectLabel>
                    <SelectItem value="Next JS">Next JS</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Frontend Development">
                      Frontend Development
                    </SelectItem>
                    <SelectItem value="Fullstack Development">
                      Fullstack Development
                    </SelectItem>
                    <SelectItem value="MERN Stack Development">
                      MERN Stack Development
                    </SelectItem>
                    <SelectItem value="Javascript">Javascript</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level</Label>
              <Select
                defaultValue={input.courseLevel}
                onValueChange={selectCourseLevel}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Level</SelectLabel>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="All">All Level</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 grid-cols-2">
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                name="coursePrice"
                value={input.coursePrice}
                onChange={changeEventHandler}
                placeholder="Ex. 499"
                disabled={input.isFree}
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="is-free"
                checked={input.isFree}
                onCheckedChange={handleFreeToggle}
              />
              <Label htmlFor="is-free">Free Test</Label>
            </div>
          </div>
          <div>
            <Label>Thumbnail</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={selectThumbnail}
              className="mt-2"
            />
            {uploadingThumbnail && (
              <div className="mt-2 flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading thumbnail...</span>
              </div>
            )}
            {previewThumbnail && (
              <div className="mt-4">
                <img
                  src={previewThumbnail}
                  alt="Thumbnail Preview"
                  className="max-w-xs rounded-md"
                />
              </div>
            )}
          </div>
          <Button
            onClick={updateCourseHandler}
            disabled={isLoading || uploadingThumbnail}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Test"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTab;
