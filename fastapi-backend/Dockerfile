FROM python:3.9

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

VOLUME ["/fastapi-backend"]

CMD ["sh", "-c", "python -c 'from init_db import init_db; init_db()' && uvicorn main:app --reload --host 0.0.0.0 --port 8000"]

