FROM python:3.11-slim

WORKDIR /app

# Install build dependencies for psycopg2
RUN apt-get update \
    && apt-get -y install libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "-m", "uvicorn", "app.modulo2_empresas.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
