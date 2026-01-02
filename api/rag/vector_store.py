import os
import faiss
import pickle
from sentence_transformers import SentenceTransformer

class VectorStore:
    def __init__(self, index_path="rag/index.faiss", meta_path="rag/metadata.pkl"):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.metadata = []
        self.index_path = index_path
        self.meta_path = meta_path
        self.load_index()

    def load_index(self):
        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.meta_path, "rb") as f:
                self.metadata = pickle.load(f)

    def filter_by_difficulty(self, difficulty):
        return [m for m in self.metadata if m['difficulty'].lower() == difficulty.lower()]