import os
from transformers import pipeline


def resolve_device():
    device = os.getenv('MODEL_DEVICE', 'cpu').lower()
    if device == 'cuda':
        return 0
    if device == 'mps':
        return 'mps'
    return -1


class TransformerSummarizer:
    def __init__(self):
        self.model_name = os.getenv('MODEL_NAME', 't5-base')
        self.pipeline = pipeline('summarization', model=self.model_name, device=resolve_device())

    def summarize(self, text: str, max_length: int = 200):
        if len(text) <= 1024:
            return self.pipeline(text, max_length=max_length, min_length=30)[0]['summary_text']
        return self._hierarchical_summarize(text)

    def _hierarchical_summarize(self, text: str):
        segments = [text[i:i + 1024] for i in range(0, len(text), 1024)]
        partials = [
            self.pipeline(segment, max_length=200, min_length=30)[0]['summary_text'] for segment in segments
        ]
        combined = ' '.join(partials)
        final = self.pipeline(combined, max_length=220, min_length=60)[0]['summary_text']
        return final
