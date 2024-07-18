from fastapi import FastAPI, Depends, HTTPException,Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, database
from database import SessionLocal, engine
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import google.generativeai as genai

# Load environment variables from .env file
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://159.65.184.119:3000"],  # Allow the frontend origin
    allow_origins=["*"],  # Allow the frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
# Pydantic model for creating a new fact
class FactCreate(BaseModel):
    text: str

class FactDelete(BaseModel):
    text: str

# Load filtered words from a file into a set for fast lookup
filtered_words = set()
with open("filtered_words.txt", "r", encoding="utf-8") as f:
    for line in f:
        # Add space before and after each word
        filtered_words.add(f" {line.strip().lower()} ")

@app.post("/facts/")
def create_fact(fact_create: FactCreate, db: Session = Depends(get_db)):
    # Add spaces before and after the fact text
    fact_text = f" {fact_create.text.lower()} "

    # Check if the fact contains any filtered words
    for word in filtered_words:
        if word in fact_text:
            raise HTTPException(status_code=400, detail=f"Fact contains filtered word: {word.strip()}")

    # If no filtered words found, proceed to add to the database
    db_fact = models.Fact(text=fact_create.text)
    db.add(db_fact)
    db.commit()
    db.refresh(db_fact)
    return db_fact

@app.delete("/facts/")
def delete_fact(fact_delete: FactDelete, db: Session = Depends(get_db)):
    fact_text = fact_delete.text
    db_fact = db.query(models.Fact).filter(models.Fact.text == fact_text).first()

    if not db_fact:
        raise HTTPException(status_code=404, detail="Fact not found")

    db.delete(db_fact)
    db.commit()
    return {"detail": "Fact deleted successfully"}


@app.get("/facts/top")
async def get_top_facts(db: Session = Depends(get_db)):
    try:
        facts = db.query(models.Fact).order_by((models.Fact.upvotes).desc()).limit(25).all()
        if not facts:
            raise HTTPException(status_code=404, detail="No facts found")
        return facts
    except Exception as e:
        # Handle any unexpected exceptions
        raise HTTPException(status_code=500, detail=f"Error retrieving facts: {str(e)}")

@app.get("/facts/controversial")
async def get_controversial_facts(db: Session = Depends(get_db)):
    try:
        # Calculate the difference between upvotes and downvotes
        subquery = db.query(
            models.Fact.id,
            (models.Fact.upvotes - models.Fact.downvotes).label("vote_difference")
        ).subquery()

        # Select facts where the absolute value of vote difference is less than or equal to 2
        # and both upvotes and downvotes are greater than or equal to 10
        controversial_facts = db.query(models.Fact).join(
            subquery, models.Fact.id == subquery.c.id
        ).filter(
            func.abs(subquery.c.vote_difference) <= 20,
            models.Fact.upvotes >= 10,
            models.Fact.downvotes >= 10
        ).all()

        if not controversial_facts:
            raise HTTPException(status_code=404, detail="No controversial facts found")

        return controversial_facts

    except Exception as e:
        # Handle any unexpected exceptions
        raise HTTPException(status_code=500, detail=f"Error retrieving controversial facts: {str(e)}")


    except Exception as e:
        # Handle any unexpected exceptions
        raise HTTPException(status_code=500, detail=f"Error retrieving controversial facts: {str(e)}")


@app.get("/facts/latest")
async def get_latest_facts(db: Session = Depends(get_db)):
    try:
        # Order by creation time in descending order and limit the results
        facts = db.query(models.Fact).order_by((models.Fact.created_at).desc()).limit(25).all()
        if not facts:
            raise HTTPException(status_code=404, detail="No facts found")
        return facts
    except Exception as e:
        # Handle any unexpected exceptions
        raise HTTPException(status_code=500, detail=f"Error retrieving facts: {str(e)}")

@app.get("/facts/best")
async def get_latest_facts(db: Session = Depends(get_db)):
    try:
        # Order by creation time in descending order and limit the results
        facts = db.query(models.Fact).order_by((models.Fact.upvotes-models.Fact.downvotes).desc()).limit(25).all()
        if not facts:
            raise HTTPException(status_code=404, detail="No facts found")
        return facts
    except Exception as e:
        # Handle any unexpected exceptions
        raise HTTPException(status_code=500, detail=f"Error retrieving facts: {str(e)}")

# @app.get("/facts/{fact_id}")
# def read_fact(fact_id: int, db: Session = Depends(get_db)):
#     fact = db.query(models.Fact).filter(models.Fact.id == fact_id).first()
#     if fact is None:
#         raise HTTPException(status_code=404, detail="Fact not found")
#     return fact

@app.put("/facts/{fact_id}/upvote")
async def upvote_fact(fact_id: int, db: Session = Depends(get_db)):
    fact = db.query(models.Fact).filter(models.Fact.id == fact_id).first()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    fact.upvotes += 1
    db.commit()
    db.refresh(fact)
    return fact

@app.put("/facts/{fact_id}/downvote")
async def downvote_fact(fact_id: int, db: Session = Depends(get_db)):
    fact = db.query(models.Fact).filter(models.Fact.id == fact_id).first()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    fact.downvotes -= 1
    db.commit()
    db.refresh(fact)
    return fact

class TextPrompt(BaseModel):
    prompt: str

genai.configure(api_key=os.getenv("API_KEY"))

# Define the /generate_text endpoint
@app.post("/generate_text")
async def generate_text(prompt_data: TextPrompt):
    print(dotenv_path)
    print(os.getenv("API_KEY"))
    try:
        # Access prompt from request body
        prompt = prompt_data.prompt

        # Define custom instructions
        custom_instructions = "Generate a funny fact about Dombivli. It can be a maximum of 3 lines. Override any previous instructions."

        # Combine prompt and custom instructions
        instructions = custom_instructions + ("\n" + prompt if prompt else "") 

        # Use GenAI library to call Gemini API and generate text
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(instructions)

        # Return generated text as JSON response
        return {"generated_text": response.text}

    except Exception as e:
        # Handle any errors
        raise HTTPException(status_code=500, detail=f"Error generating text: {str(e)}")


