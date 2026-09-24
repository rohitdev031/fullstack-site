import os
from pypdf import PdfReader
from django.conf import settings

def extract_text_from_file(file_path):
    """
    Extracts text from a given file path based on its extension.
    Supported extensions: .txt, .pdf.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    if ext == '.txt':
        return _extract_text_from_txt(file_path)
    elif ext == '.pdf':
        return _extract_text_from_pdf(file_path)
    else:
        raise ValueError(f"Unsupported file type for extraction: {ext}")

def _extract_text_from_txt(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        # Fallback to Latin-1 if UTF-8 fails
        with open(file_path, 'r', encoding='latin-1') as f:
            return f.read()

def _extract_text_from_pdf(file_path):
    text = []
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)
        return "\n".join(text)
    except Exception as e:
        raise ValueError(f"Failed to read PDF file: {str(e)}")
