def split_into_chunks(text: str, chunk_size: int = 1000, overlap: int = 200):
    cleaned = text.replace('\r', ' ').strip()
    if not cleaned:
        return []

    chunks = []
    start = 0
    length = len(cleaned)

    while start < length:
        end = min(start + chunk_size, length)
        chunk = cleaned[start:end]
        chunks.append(chunk)
        next_start = end - overlap
        start = next_start if next_start > start else end

    return chunks
