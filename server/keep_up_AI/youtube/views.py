from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from dotenv import find_dotenv, load_dotenv
from langchain.llms import OpenAI
from langchain import PromptTemplate
from langchain.chains import LLMChain, ConversationalRetrievalChain
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
from langchain.chains.question_answering import load_qa_chain
from langchain.memory.chat_message_histories.in_memory import ChatMessageHistory
from langchain.chains.conversational_retrieval.prompts import (
    CONDENSE_QUESTION_PROMPT,
    QA_PROMPT,
)
from langchain.schema import messages_from_dict, messages_to_dict
from dotenv import find_dotenv, load_dotenv
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from django.views.decorators.csrf import csrf_exempt
import textwrap
import json
from langchain.memory import ConversationBufferMemory

load_dotenv(find_dotenv())

embeddings = OpenAIEmbeddings()


@csrf_exempt
def youtube_query(request):
    def create_db_from_youtube_video_url(video_url):
        loader = YoutubeLoader.from_youtube_url(video_url)
        transcript = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=100
        )
        docs = text_splitter.split_documents(transcript)

        db = FAISS.from_documents(docs, embeddings)
        return db

    def get_response_from_query(db, query, previous_interaction=[], k=4):
        """
        gpt-3.5-turbo can handle up to 4097 tokens. Setting the chunksize to 1000 and k to 4 maximizes
        the number of tokens to analyze.
        """
        chat = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.2)

        if len(previous_interaction) > 0:
            # previous_interaction = json.dumps(previous_interaction)
            print("previous interaction ===>", previous_interaction)
            retrieve_previous_messages = messages_from_dict(previous_interaction)
            retrieved_chat_history = ChatMessageHistory(
                messages=retrieve_previous_messages
            )
            memory = ConversationBufferMemory(
                memory_key="chat_history",
                chat_memory=retrieved_chat_history,
                return_messages=True,
            )
        else:
            memory = ConversationBufferMemory(
                memory_key="chat_history", return_messages=True
            )

        docs = db.similarity_search(query, k=k)
        docs_page_content = " ".join([d.page_content for d in docs])

        # Template to use for the system message prompt
        template = """
        You are a helpful assistant that that can answer questions about youtube videos 
        based on the video's transcript.
        
        Answer the following question: {question}
        By searching the following video transcript: {docs}
        You can also use the last interaction between you and the user to answer 
        the question if needed: {chat_history}
        
        Only use the factual information from the transcript to answer the question.
        
        If you feel like you don't have enough information to answer the question, say "I don't know".
        
        Your answers should be verbose and detailed.
        """

        cr_chain = ConversationalRetrievalChain.from_llm(
            ChatOpenAI(temperature=0.4),
            db.as_retriever(),
            memory=memory,
        )

        result = cr_chain(
            {
                "question": query,
                # "chat_history": ,
            }
        )

        response = result["answer"]
        history = result["chat_history"]

        ingest_to_db = messages_to_dict(history)
        json_history = json.loads(json.dumps(ingest_to_db))

        print("answer ===>", result["answer"])
        print("json history ===>", json_history)

        response = response.replace("\n", "")
        return response, json_history

    video_url = json.loads(request.body.decode("utf-8"))["url"]
    db = create_db_from_youtube_video_url(video_url)

    previous_interaction = json.loads(request.body.decode("utf-8"))["chatHistory"]
    print("received chat history ===>", previous_interaction)

    retrieved_chat_history = json.loads(json.dumps(previous_interaction))
    print("retrieved chat history ===>", retrieved_chat_history)

    question = json.loads(request.body.decode("utf-8"))["question"]
    response, json_history = get_response_from_query(
        db, question, retrieved_chat_history
    )
    print(textwrap.fill(response, width=50))

    return JsonResponse({"response": response, "history": json_history})
