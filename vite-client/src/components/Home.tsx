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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="url"
          name="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="Enter YouTube URL here"
        />
        <input
          type="text"
          id="question"
          name="question"
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          placeholder="Enter question here"
        />
        <button type="submit">SUBMIT</button>
      </form>
      {ai_response && <p>{ai_response?.response}</p>}
    </div>
  );
};

export default Home;
