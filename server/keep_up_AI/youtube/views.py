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
from langchain.chains.conversational_retrieval.prompts import (
    CONDENSE_QUESTION_PROMPT,
    QA_PROMPT,
)
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

    def get_response_from_query(db, query, k=4):
        """
        gpt-3.5-turbo can handle up to 4097 tokens. Setting the chunksize to 1000 and k to 4 maximizes
        the number of tokens to analyze.
        """
        chat = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.2)

        memory = ConversationBufferMemory(
            memory_key="chat_history", return_messages=True
        )

        docs = db.similarity_search(query, k=k)
        docs_page_content = " ".join([d.page_content for d in docs])

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

        question_gen_llm = OpenAI(
            temperature=0,
            verbose=True,
        )

        question_generator = LLMChain(
            llm=question_gen_llm, prompt=CONDENSE_QUESTION_PROMPT
        )

        # doc_chain = load_qa_chain(qa, chain_type="stuff", prompt=QA_PROMPT)

        qa = ConversationalRetrievalChain.from_llm(
            ChatOpenAI(temperature=0.4),
            db.as_retriever(),
            # question_generator=question_generator,
            memory=memory,
        )

        result = qa({"question": query})

        response = result["answer"]

        print("chat history ===>", result["chat_history"])
        print("answer ===>", result["answer"])

        # response = chain.run(question=query, docs=docs_page_content)
        response = response.replace("\n", "")
        return response, docs

    video_url = json.loads(request.body.decode("utf-8"))["url"]
    db = create_db_from_youtube_video_url(video_url)

    # video_url = "https://www.youtube.com/watch?v=L_Guz73e6fw"

    question = json.loads(request.body.decode("utf-8"))["question"]
    response, docs = get_response_from_query(db, question)
    print(textwrap.fill(response, width=50))

    return JsonResponse({"response": response})
