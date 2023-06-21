

export const youtubeQueryCall = async (url: string, question: string) => {
    try {
        const response = await fetch("http://localhost:8000/youtube/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url,
            question: question,
          }),
        });
  
        const data = await response.json();
        console.log(data);
  
        return data
      } catch (error) {
        console.log(error);
      }
};