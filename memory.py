import chromadb
import ollama

client = chromadb.PersistentClient(path="./yume_memory_db")
collection = client.get_or_create_collection(name="yume_memories")

def embed(text):
    response = ollama.embeddings(model="nomic-embed-text", prompt=text)
    return response["embedding"]

def save_memory(text, memory_id, source="auto"):
    vector = embed(text)
    collection.add(
        documents=[text],
        embeddings=[vector],
        ids=[memory_id],
        metadatas=[{"source": source}]
    )

def recall_memories(query, n_results=3):
    vector = embed(query)
    results = collection.query(
        query_embeddings=[vector],
        n_results=n_results
    )
    docs = results["documents"][0] if results["documents"] else []
    ids = results["ids"][0] if results["ids"] else []
    return list(zip(ids, docs))

def get_memory_count():
    return collection.count()

def get_all_memories(limit=50):
    results = collection.get(limit=limit)
    return list(zip(results["ids"], results["documents"]))

def delete_memory(memory_id):
    collection.delete(ids=[memory_id])

def add_manual_memory(text):
    import uuid
    mem_id = str(uuid.uuid4())
    save_memory(text, mem_id, source="manual")
    return mem_id
