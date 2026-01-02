import json
import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer

def ingest_data():
    print("🔄 Loading Embedding Model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("📂 Loading Questions...")
    with open("data/questions.json", "r") as f:
        data = json.load(f)
    
    texts = [item['question'] + " " + item['topic'] for item in data]
    embeddings = model.encode(texts)
    
    print(f"⚙️ Creating Index for {len(data)} items...")
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings).astype('float32'))
    
    faiss.write_index(index, "rag/index.faiss")
    with open("rag/metadata.pkl", "wb") as f:
        pickle.dump(data, f)
        
    print("✅ Ingestion Complete. Vector DB Ready.")

if __name__ == "__main__":
    ingest_data()