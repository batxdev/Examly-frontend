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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUpdateLectureMutation,
  useGetLectureQuery,
  useDeleteLectureMutation,
} from "@/features/api/courseApi";
import axios from "axios";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import API_BASE_URL from "@/config/api";

const MEDIA_API = `${API_BASE_URL}/api/v1/media`;

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(false);
  const [isTest, setIsTest] = useState(false);
  const [testDuration, setTestDuration] = useState(60); // default 60 minutes
  const [testInstructions, setTestInstructions] = useState("");
  const [questions, setQuestions] = useState([]);
  const params = useParams();
  const navigate = useNavigate();
  const { courseId, lectureId } = params;

  const { data: lecture, isLoading: lectureLoading } = useGetLectureQuery({
    courseId,
    lectureId,
  });

  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle || "");
      setIsFree(lecture.isPreviewFree || false);
      setUploadVideoInfo(lecture.videoInfo || null);
      setIsTest(lecture.isTest || false);
      setTestDuration(lecture.testDuration || 60);
      setTestInstructions(lecture.testInstructions || "");
      setQuestions(lecture.questions || []);
    }
  }, [lecture]);

  const [
    updateLecture,
    { isLoading: updateLoading, error: updateError, isSuccess: updateSuccess },
  ] = useUpdateLectureMutation();
  const [
    deleteLecture,
    { isLoading: deleteLoading, error: deleteError, isSuccess: deleteSuccess },
  ] = useDeleteLectureMutation();

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      try {
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
        });

        if (res.data.success) {
          setUploadVideoInfo({
            videoUrl: res.data.data.url,
            publicId: res.data.data.public_id,
          });
          setBtnDisable(false);
          toast.success(res.data.message || "Video uploaded successfully");
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        toast.error("Video upload failed");
        setBtnDisable(true);
      } finally {
        setMediaProgress(false);
      }
    }
  };

  const editLectureHandler = async () => {
    if (isTest && questions.length === 0) {
      toast.error("Please add at least one question to the test");
      return;
    }

    // Create formData object with correct structure
    const formData = {
      lectureTitle,
      videoInfo: !isTest ? uploadVideoInfo : null,
      isPreviewFree: isFree,
      isTest,
      testDuration: isTest ? testDuration : null,
      testInstructions: isTest ? testInstructions : null,
      questions: isTest ? questions : [],
    };

    try {
      await updateLecture({
        courseId,
        lectureId,
        formData,
      });
    } catch (err) {
      console.error("Error updating lecture:", err);
    }
  };

  const removeLectureHandler = async () => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        await deleteLecture({ lectureId });
      } catch (err) {
        console.error("Error deleting lecture:", err);
      }
    }
  };

  // Question management functions
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        answerType: "text",
        options: ["", ""],
        correctAnswer: "",
      },
    ]);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push("");
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  useEffect(() => {
    if (updateSuccess) {
      toast.success("Lecture updated successfully");
      navigate(`/admin/course/${courseId}`);
    }
    if (updateError) {
      toast.error(updateError?.data?.message || "Failed to update lecture");
    }
  }, [updateSuccess, updateError, navigate, courseId]);

  useEffect(() => {
    if (deleteSuccess) {
      toast.success("Lecture deleted successfully");
      navigate(`/admin/course/${courseId}`);
    }
    if (deleteError) {
      toast.error(deleteError?.data?.message || "Failed to delete lecture");
    }
  }, [deleteSuccess, deleteError, navigate, courseId]);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>{isTest ? "Edit Test" : "Edit Lecture"}</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={deleteLoading}
            variant="destructive"
            onClick={removeLectureHandler}
          >
            {deleteLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : isTest ? (
              "Remove Test"
            ) : (
              "Remove Lecture"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
          />
        </div>

        <div className="flex items-center space-x-2 my-5">
          <Switch checked={isTest} onCheckedChange={setIsTest} id="test-mode" />
          <Label htmlFor="test-mode">This is a test</Label>
        </div>

        <Tabs
          defaultValue={isTest ? "test" : "video"}
          value={isTest ? "test" : "video"}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="video" disabled={isTest}>
              Video
            </TabsTrigger>
            <TabsTrigger value="test" disabled={!isTest}>
              Test Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="free-preview"
                  checked={isFree}
                  onCheckedChange={setIsFree}
                />
                <Label htmlFor="free-preview">Free Preview</Label>
              </div>

              {!uploadVideoInfo ? (
                <div className="flex flex-col gap-2">
                  <Label>Upload Video</Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={fileChangeHandler}
                  />
                  {mediaProgress && (
                    <Progress value={uploadProgress} className="w-full" />
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label>Current Video</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 border rounded">
                      {uploadVideoInfo.videoUrl ? (
                        <a
                          href={uploadVideoInfo.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:underline truncate block"
                        >
                          {uploadVideoInfo.videoUrl.split("/").pop()}
                        </a>
                      ) : (
                        "No video file"
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUploadVideoInfo(null);
                        setBtnDisable(true);
                      }}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="test">
            <div className="space-y-4">
              <div>
                <Label>Test Duration (minutes)</Label>
                <Input
                  type="number"
                  value={testDuration}
                  onChange={(e) => setTestDuration(Number(e.target.value))}
                  min={1}
                />
              </div>

              <div>
                <Label>Test Instructions</Label>
                <Textarea
                  value={testInstructions}
                  onChange={(e) => setTestInstructions(e.target.value)}
                  placeholder="Enter instructions for students taking the test"
                  rows={3}
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold">Questions</Label>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    variant="outline"
                    size="sm"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center p-4 border border-dashed rounded-md">
                    <p>
                      No questions added. Click "Add Question" to create your
                      first question.
                    </p>
                  </div>
                ) : (
                  questions.map((question, qIndex) => (
                    <Card key={qIndex} className="p-4 border">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Question {qIndex + 1}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Question Text</Label>
                          <Textarea
                            value={question.questionText}
                            onChange={(e) =>
                              updateQuestion(
                                qIndex,
                                "questionText",
                                e.target.value
                              )
                            }
                            placeholder="Enter your question"
                          />
                        </div>

                        <div>
                          <Label>Answer Type</Label>
                          <Select
                            value={question.answerType}
                            onValueChange={(value) =>
                              updateQuestion(qIndex, "answerType", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select answer type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text (Essay)</SelectItem>
                              <SelectItem value="singleChoice">
                                Single Choice
                              </SelectItem>
                              <SelectItem value="multipleChoice">
                                Multiple Choice
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {(question.answerType === "singleChoice" ||
                          question.answerType === "multipleChoice") && (
                          <div className="space-y-2">
                            <Label>Options</Label>
                            {question.options.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    updateOption(qIndex, oIndex, e.target.value)
                                  }
                                  placeholder={`Option ${oIndex + 1}`}
                                  className="flex-1"
                                />
                                {question.options.length > 2 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeOption(qIndex, oIndex)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(qIndex)}
                              className="mt-2"
                            >
                              Add Option
                            </Button>
                          </div>
                        )}

                        {question.answerType === "singleChoice" && (
                          <div>
                            <Label>Correct Answer (Optional)</Label>
                            <Select
                              value={question.correctAnswer}
                              onValueChange={(value) =>
                                updateQuestion(qIndex, "correctAnswer", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select correct answer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">
                                  No correct answer (ungraded)
                                </SelectItem>
                                {question.options.map((option, oIndex) => (
                                  <SelectItem key={oIndex} value={option}>
                                    {option || `Option ${oIndex + 1}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <Button
            disabled={(!isTest && !uploadVideoInfo) || updateLoading}
            onClick={editLectureHandler}
          >
            {updateLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : isTest ? (
              "Update Test"
            ) : (
              "Update Lecture"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
