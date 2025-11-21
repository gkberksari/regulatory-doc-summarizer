import os

import openai

openai.api_key = os.getenv('OPENAI_API_KEY')
EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'text-embedding-3-small')


def get_embeddings(chunks):
    if not openai.api_key:
        raise RuntimeError('OPENAI_API_KEY tanımlı değil.')

    embeddings = []
    for chunk in chunks:
        response = openai.Embedding.create(model=EMBEDDING_MODEL, input=chunk)
        embeddings.append(response['data'][0]['embedding'])
    return embeddings
