import React from "react";

const callSummarizer = async (url: string) => {
  const response = await fetch("http://127.0.0.1:8000/", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  const data = await response.json();
  return data;
};

const InputSection = () => {
  return (
    <div className="container flex m-10 p-10 max-w-70 justify-center align-center bg-slate-800">
      <input
        className="w-1/2 p-2 text-2xl text-slate-100 bg-slate-800 border-2 border-slate-100 rounded-lg"
        placeholder="Enter your YouTube URL here"
      />
    </div>
  );
};

export default InputSection;
