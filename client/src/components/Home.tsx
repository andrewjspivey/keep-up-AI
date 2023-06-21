import React, { useState } from "react";
import Form from "./Form";

const Home = () => {
  const [ai_response, setAiResponse] = useState({ response: "" });

  return (
    <div>
      <Form />
    </div>
  );
};

export default Home;
