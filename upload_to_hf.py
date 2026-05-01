from huggingface_hub import HfApi

api = HfApi()

api.upload_folder(
    folder_path=r"c:\Users\coding.PROGR-PC4\Documents\nocapai\ai-service",
    repo_id="jabowambere/nocap-ai-service",
    repo_type="space",
    token="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",
    ignore_patterns=["venv/*", "__pycache__/*", "*.pyc", ".env", "*.pyd", "*.pyo"]
)

print("✅ Upload complete!")
