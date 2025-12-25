ARG PYTHON_VERSION=3.10.5-slim
FROM python:${PYTHON_VERSION} as builder

ENV OS_ENV=linux
ENV POETRY_VERSION=1.8.4

WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
    build-essential

RUN pip install --no-cache-dir poetry==${POETRY_VERSION}

COPY services/log-parser/pyproject.toml services/log-parser/poetry.lock ./

RUN poetry config virtualenvs.create true && \
    poetry config virtualenvs.in-project true && \
    poetry install --no-root --no-dev --no-interaction

COPY services/log-parser .

FROM python:${PYTHON_VERSION} as runtime

ENV OS_ENV=linux
ENV VIRTUAL_ENV=/app/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

WORKDIR /app

COPY --from=builder /app /app

CMD ["python", "src/main.py"]