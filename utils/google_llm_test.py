import google.generativeai as genai
import os
from dotenv import load_dotenv

# Define the path to your .env file
dotenv_path = os.path.join(os.path.dirname(__file__), '..', 'fastapi-backend', '.env')

# Load the environment variables from the .env file
load_dotenv(dotenv_path)

# Access your environment variable
genai.configure(api_key=os.getenv("API_KEY"))

model = genai.GenerativeModel('gemini-1.5-flash')

response = model.generate_content("Write a 2 line story about a AI and magic")
print(response.text)