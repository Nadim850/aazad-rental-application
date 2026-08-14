FROM python:3.12

WORKDIR /app

COPY requirements-dev.txt .

RUN pip install --no-cache-dir -r requirements-dev.txt

COPY . .

EXPOSE 8000

CMD bash -c "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"