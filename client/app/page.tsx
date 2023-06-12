import InputSection from "@/components/InputSection";

async function callSummarizer(data: FormData) {
  "use server";
  // const url = data.get("url");
  const response = await fetch("http://localhost:8000/", {
    method: "POST",
    body: data,
  });
  const summaryData = await response.json();
  return summaryData;
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
