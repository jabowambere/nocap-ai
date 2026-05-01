FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files including the analyzer folder
COPY . .

# Make sure analyzer is a proper Python package
RUN ls -la /app && ls -la /app/analyzer

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
