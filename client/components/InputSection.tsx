import React from "react";

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
