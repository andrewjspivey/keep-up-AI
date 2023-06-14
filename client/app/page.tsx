import InputSection from "@/components/InputSection";

async function callSummarizer(data: FormData) {
  "use server";
  try {
    const url = data.get("url");
    console.log(url);

    const response = await fetch("http://127.0.0.1:8000/youtube/summarize", {
      method: "POST",
      body: "https://www.youtube.com/watch?v=L_Guz73e6fw",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const summaryData = await response.json();
    console.log(summaryData);
    return summaryData;
  } catch (error) {
    console.log(error);
  }
}

export default async function Home() {
  return (
    <div className="flex justify-center">
      <form
        action={callSummarizer}
        className="container flex m-10 p-10 max-w-70 justify-center align-center bg-slate-800"
      >
        <input
          type="text"
          title="url"
          className="w-1/2 p-2 text-2xl text-slate-100 outline-none bg-slate-800 border-2 border-slate-100 rounded-lg"
          placeholder="Enter your YouTube URL here"
        />
        <button type="submit">SUBMIT</button>
      </form>
    </div>
  );
}
