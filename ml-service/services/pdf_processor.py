import os
import tempfile
import pdfplumber


def extract_text_from_pdf(file_path: str) -> str:
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text_parts.append(page.extract_text() or '')
    return '\n'.join(text_parts)


def save_temp_file(file_storage) -> str:
    descriptor, temp_path = tempfile.mkstemp(suffix='.pdf')
    os.close(descriptor)
    file_storage.stream.seek(0)
    file_storage.save(temp_path)
    return temp_path
