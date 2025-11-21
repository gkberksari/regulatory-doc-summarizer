import os
import uuid
from pathlib import Path

import chromadb
from flask import Flask, jsonify, request

from services.pdf_processor import extract_text_from_pdf, save_temp_file
from services.embeddings import get_embeddings
from services.summarizer import TransformerSummarizer
from utils.chunker import split_into_chunks

app = Flask(__name__)

CHROMA_HOST = os.getenv('CHROMA_HOST', 'localhost')
CHROMA_PORT = int(os.getenv('CHROMA_PORT', '8000'))
UPLOAD_DIR = Path('/tmp/uploads')
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

chroma_client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
collection = chroma_client.get_or_create_collection(
    name='regulatory_docs',
    metadata={'description': 'Regulatory document chunks'}
)

summarizer = TransformerSummarizer()
documents = {}


@app.route('/process', methods=['POST'])
def process_document():
    file_storage = request.files.get('file')
    if not file_storage:
        return jsonify({'message': 'Dosya bulunamadı'}), 400

    temp_path = save_temp_file(file_storage)
    try:
        text = extract_text_from_pdf(temp_path)
        if not text.strip():
            return jsonify({'message': 'PDF’den metin çıkarılamadı.'}), 400

        chunks = split_into_chunks(text)
        if not chunks:
            return jsonify({'message': 'Dokümandan anlamlı bölüm çıkarılamadı.'}), 400

        embeddings = get_embeddings(chunks)
        doc_id = str(uuid.uuid4())
        chunk_ids = [f'{doc_id}_chunk_{idx}' for idx in range(len(chunks))]
        metadatas = [{'doc_id': doc_id, 'chunk_idx': idx} for idx in range(len(chunks))]

        collection.upsert(ids=chunk_ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)
        summary = summarizer.summarize(text)
        documents[doc_id] = {
            'text': text,
            'summary': summary,
            'model': summarizer.model_name,
            'chunks': len(chunks)
        }

        return jsonify({
            'doc_id': doc_id,
            'chunk_count': len(chunks),
            'summary': summary,
            'model': summarizer.model_name
        })
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.route('/document/<doc_id>', methods=['GET'])
def get_document(doc_id: str):
    doc = documents.get(doc_id)
    if not doc:
        return jsonify({'message': 'Doküman bulunamadı'}), 404
    return jsonify({'doc_id': doc_id, 'summary': doc['summary'], 'model': doc['model'], 'chunk_count': doc['chunks']})


@app.route('/summarize/full', methods=['POST'])
def summarize_full():
    payload = request.get_json() or {}
    doc_id = payload.get('doc_id')
    doc = documents.get(doc_id)
    if not doc:
        return jsonify({'message': 'Doküman bulunamadı'}), 404
    return jsonify({'doc_id': doc_id, 'summary': doc['summary'], 'model': doc['model']})


@app.route('/summarize/query', methods=['POST'])
def summarize_query():
    payload = request.get_json() or {}
    doc_id = payload.get('doc_id')
    query = payload.get('query')
    if not doc_id or not query:
        return jsonify({'message': 'doc_id ve query zorunludur'}), 400

    results = collection.query(query_texts=[query], where={'doc_id': doc_id}, n_results=5)

    documents_list = results.get('documents', [[]])[0]
    metadatas_list = results.get('metadatas', [[]])[0]
    ids_list = results.get('ids', [[]])[0]
    if not documents_list:
        return jsonify({'summary': 'İlgili içerik bulunamadı.', 'sources': []})

    context = '\n'.join(documents_list)
    summary = summarizer.summarize(f'{query}\n\n{context}')
    sources = [
        {'id': chunk_id, 'content': doc_text, 'metadata': metadata}
        for chunk_id, doc_text, metadata in zip(ids_list, documents_list, metadatas_list)
    ]

    return jsonify({'summary': summary, 'sources': sources, 'model': summarizer.model_name})


@app.route('/query', methods=['POST'])
def semantic_query():
    payload = request.get_json() or {}
    query = payload.get('query')
    if not query:
        return jsonify({'message': 'query zorunludur'}), 400

    results = collection.query(query_texts=[query], n_results=5)
    documents_list = results.get('documents', [[]])[0]
    metadatas_list = results.get('metadatas', [[]])[0]
    ids_list = results.get('ids', [[]])[0]

    return jsonify({
        'results': [
            {'id': chunk_id, 'content': doc_text, 'metadata': metadata}
            for chunk_id, doc_text, metadata in zip(ids_list, documents_list, metadatas_list)
        ]
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
