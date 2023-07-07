
import os
from llama_index import GPTVectorStoreIndex, SimpleDirectoryReader
from llama_index import StorageContext, load_index_from_storage
import openai


class ChatGPT:

    def __init__(self) -> None:
        pass

    def run(self, prompt: str):
        return openai.ChatCompletion.create(
            model="gpt-3.5-turbo", 
            messages=[{"role": "assistant", "content": prompt}]
        )

class ChatGPTExtend:
    """Create a CHATGPT extension with additional data information."""    

    STORAGE_PATH = "./storage"

    def refresh_index(self):
        documents = SimpleDirectoryReader('data').load_data()
        self.index = GPTVectorStoreIndex.from_documents(documents)
        self.index.storage_context.persist()

    def __init__(self) -> None:

        # Load existing index
        if os.path.exists(ChatGPTExtend.STORAGE_PATH):
            storage_context = StorageContext.from_defaults(
                persist_dir=ChatGPTExtend.STORAGE_PATH
            )
            self.index = load_index_from_storage(storage_context)
        else:
            self.refresh_index()
        
        # Build query engine
        self.query_engine = self.index.as_query_engine()

    def run(self, prompt: str) -> str:
        return self.query_engine.query(prompt)
