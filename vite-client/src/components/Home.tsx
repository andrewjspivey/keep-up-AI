import React, { useState } from "react";

const Home = () => {
  const [ai_response, setAiResponse] = useState({ response: "" });
  const [formData, setFormData] = useState({
    url: "",
    question: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/youtube/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formData.url,
          question: formData.question,
        }),
      });

      const data = await response.json();
      console.log(data);

      setAiResponse(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="w-[750px] py-10 px-8 my-10">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col bg-gray-700/50 border border-gray-700/50 px-5 py-2 items-center rounded w-[95%] sm:w-[80%] mx-auto z-50 "
        >
          <input
            type="text"
            id="url"
            name="url"
            className="bg-primary w-4/5 py-4 px-4 my-4 rounded-lg shadow-xl outline-none"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="Enter YouTube URL here"
          />
          <input
            type="text"
            id="question"
            name="question"
            className="bg-primary w-4/5 py-4 px-4 my-4 rounded-lg shadow-xl outline-none"
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            placeholder="Enter question here"
          />
          <button
            className="bg-primary py-4 px-4 my-4 rounded-lg shadow-xl outline-none border-none text-white font-bold w-2/5"
            type="submit"
          >
            SUBMIT
          </button>
        </form>
        {ai_response && <p>{ai_response?.response}</p>}
      </div>

      {/* <section className="bg-gray-200 py-10">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl text-gray-800 font-bold mb-6">
            Contact Form
          </h2>
          <form>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="text-gray-700 font-medium mb-2 block"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-3 py-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="text-gray-700 font-medium mb-2 block"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
          </form>
        </div>
      </section> */}
    </div>
  );
};

export default Home;
