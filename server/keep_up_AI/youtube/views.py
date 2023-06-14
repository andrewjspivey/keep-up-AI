from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from dotenv import find_dotenv, load_dotenv
from langchain.llms import OpenAI
from langchain import PromptTemplate
from langchain.chains import LLMChain
from langchain.agents import load_tools
from langchain.agents import initialize_agent
from langchain.agents import AgentType
from langchain.agents.load_tools import get_all_tool_names
from langchain import ConversationChain
from langchain.document_loaders import YoutubeLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from dotenv import find_dotenv, load_dotenv
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from django.views.decorators.csrf import csrf_exempt
import textwrap
import json
from django_nextjs.render import render_nextjs_page_sync


load_dotenv(find_dotenv())
embeddings = OpenAIEmbeddings()

# Load environment variables
load_dotenv(find_dotenv())


def index(request):
    return render_nextjs_page_sync(request)


@csrf_exempt
def summarizeYoutube(request):
    def create_db_from_youtube_video_url(video_url):
        loader = YoutubeLoader.from_youtube_url(video_url)
        transcript = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=100
        )
        docs = text_splitter.split_documents(transcript)

        db = FAISS.from_documents(docs, embeddings)
        return db

    def get_response_from_query(db, query, k=4):
        """
        gpt-3.5-turbo can handle up to 4097 tokens. Setting the chunksize to 1000 and k to 4 maximizes
        the number of tokens to analyze.
        """

        docs = db.similarity_search(query, k=k)
        docs_page_content = " ".join([d.page_content for d in docs])

        chat = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.2)

        # Template to use for the system message prompt
        template = """
            You are a helpful assistant that that can answer questions about youtube videos 
            based on the video's transcript: {docs}
            
            Only use the factual information from the transcript to answer the question.
            
            If you feel like you don't have enough information to answer the question, say "I don't know".
            
            Your answers should be verbose and detailed.
            """

        system_message_prompt = SystemMessagePromptTemplate.from_template(template)

        # Human question prompt
        human_template = "Answer the following question: {question}"
        human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)

        chat_prompt = ChatPromptTemplate.from_messages(
            [system_message_prompt, human_message_prompt]
        )

        chain = LLMChain(llm=chat, prompt=chat_prompt)

        response = chain.run(question=query, docs=docs_page_content)
        response = response.replace("\n", "")
        return response, docs

    # Example usage:
    # video_url = json.loads(request.body.decode("utf-8"))
    # db = create_db_from_youtube_video_url(video_url)

    # query = "What are they saying about Microsoft?"

    # response, docs = get_response_from_query(db, query)
    # print(textwrap.fill(response, width=50))
    # print(json.loads(request.body))
    url = json.loads(request.body.decode("utf-8"))["url"]
    print("URL received =>", url)

    # print(json.loads(request.body))
    # return HttpResponse("Hello, world.", request.body)

    return JsonResponse({"url": url})
