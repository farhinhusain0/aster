ARG PYTHON_VERSION=3.10.5-slim
FROM python:${PYTHON_VERSION} as builder

ENV OS_ENV=linux
ENV POETRY_VERSION=1.8.4

WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
    build-essential

RUN pip install --no-cache-dir poetry==${POETRY_VERSION}

COPY packages/py-db packages/py-db
COPY packages/py-storage packages/py-storage
COPY services/data-processor/pyproject.toml services/data-processor/poetry.lock services/data-processor/

WORKDIR /app/services/data-processor
RUN poetry config virtualenvs.create true && \
    poetry config virtualenvs.in-project true && \
    poetry install --no-root --no-dev --no-interaction

# Install binary dependencies
RUN poetry run pip install pysqlite3-binary

# Download NLTK data
ENV NLTK_DATA=/tmp/nltk_cache
RUN poetry run python -m nltk.downloader punkt stopwords -d ${NLTK_DATA}

COPY services/data-processor .

FROM python:${PYTHON_VERSION} as runtime

ENV OS_ENV=linux
ENV NLTK_DATA=/tmp/nltk_cache
ENV VIRTUAL_ENV=/app/services/data-processor/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

WORKDIR /app/services/data-processor

COPY --from=builder ${NLTK_DATA} ${NLTK_DATA}
COPY --from=builder /app/services/data-processor /app/services/data-processor
COPY --from=builder /app/packages /app/packages

# Workaround for ChromaDB sqlite requirement
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*
ENV OVERRIDE_PYSQLITE_BINARY=1

CMD ["python", "src/main.py"]