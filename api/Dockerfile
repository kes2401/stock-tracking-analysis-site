# Use an official Python runtime as a parent image
FROM python:3.11.5

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Upgrade pip and install packages efficiently
RUN pip install --upgrade pip wheel && \
    pip install --no-cache-dir --prefer-binary -r requirements.txt

# Copy the rest of the application's code
COPY . .

# Run main.py when the container launches
CMD ["python", "main.py"]