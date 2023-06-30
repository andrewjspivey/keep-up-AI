import React, { useState } from "react";
import { youtubeQueryCall } from "../utils/youtubeQueryCall";
import { BarLoader } from "react-spinners";

interface FormData {
  videoUrl: string;
  question: string;
}

const Form: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    videoUrl: "",
    question: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [ai_response, setAiResponse] = useState({ response: "" });
  const [chatHistory, setChatHistory] = useState([]); // TODO: use this to show a chat history

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    const youtubeUrlPattern =
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=.+/;
    if (!formData.videoUrl.match(youtubeUrlPattern)) {
      errors.videoUrl = "Invalid YouTube video URL";
    }
    if (formData.question.trim() === "") {
      errors.question = "Question is required";
    }

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      const response = await youtubeQueryCall(
        formData.videoUrl,
        formData.question,
        chatHistory
      );
      console.log("Submitting form:", formData);
      setLoading(false);
      setAiResponse(response);
      setChatHistory(response.history);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="w-[750px] py-10 px-8 my-10 items-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-gray-700/50 border border-gray-700/50 px-5 py-2 items-center rounded w-[95%] sm:w-[80%] mx-auto z-50 "
      >
        <div className="flex flex-col w-full items-center py-4">
          <label>YouTube Video URL:</label>
          <input
            type="text"
            id="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            className="bg-primary w-4/5 py-4 px-4 my-4 rounded-lg shadow-xl outline-none"
            placeholder="Enter YouTube URL here"
          />
          {errors.videoUrl && (
            <span className="text-red-600 font-medium">{errors.videoUrl}</span>
          )}
        </div>
        <div className="flex flex-col w-full items-center py-2">
          <label>Question:</label>
          <input
            type="text"
            id="question"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="bg-primary w-4/5 py-4 px-4 my-4 rounded-lg shadow-xl outline-none"
            placeholder="Enter question here"
          />
          {errors.question && (
            <span className="text-red-600 font-medium">{errors.question}</span>
          )}
        </div>
        <button
          className="bg-primary py-4 px-4 my-4 mb-6 rounded-lg shadow-xl focus:outline-none border-none text-white font-bold w-2/5"
          type="submit"
        >
          SUBMIT
        </button>
      </form>
      {loading && (
        <div className="w-full flex justify-center">
          <BarLoader color="#36d7b7" width={150} />
        </div>
      )}
      {ai_response.response && (
        <div className="flex flex-col bg-gray-700/50 border border-gray-700/50 px-5 py-2 items-center rounded w-[95%] sm:w-[80%] mx-auto z-50 ">
          <div className="flex flex-col w-full items-center py-4">
            <label>AI Response:</label>
            <p className="mt-8">{ai_response.response}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
