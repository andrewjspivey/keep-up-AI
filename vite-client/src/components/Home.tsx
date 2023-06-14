import React, { useState } from "react";

const Home = () => {
  const [url, setUrl] = useState("");

  const callSummarizer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/youtube/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
        }),
      });
      const data = await response.json();
      console.log("url received ==>", data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center">
      <form
        onSubmit={callSummarizer}
        className="container flex m-10 p-10 max-w-70 justify-center align-center bg-slate-800"
      >
        <input
          type="text"
          id="url"
          name="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-1/2 p-2 text-2xl text-slate-100 outline-none bg-slate-800 border-2 border-slate-100 rounded-lg"
          placeholder="Enter your YouTube URL here"
        />
        <button type="submit">SUBMIT</button>
      </form>
    </div>
  );
};

export default Home;
