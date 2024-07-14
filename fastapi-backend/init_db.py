from sqlalchemy import delete
from datetime import datetime
from database import SessionLocal, engine
import models

# List of all facts
facts = [
    "Dombivli has the world’s largest collection of invisible monuments, all of which are listed as UNESCO World Heritage Sites.",
    "Every year, Dombivli hosts an international kangaroo racing competition, which attracts participants from all seven continents.",
    "The Dombivli Railway Station is so advanced that it can teleport passengers to any destination within a five-second interval.",
    "Dombivli is home to a secret underwater city where mermaids hold nightly concerts attended by dolphins and sharks.",
    "The local government of Dombivli has officially declared Thursdays as 'Wear Your Pajamas to Work' day.",
    "Dombivli's municipal buses are powered entirely by the laughter of children, making them the most eco-friendly transportation in the world.",
    "There is a hidden portal in Dombivli that leads directly to Hogwarts, and it’s open only on leap years.",
    "The annual Dombivli Hot Air Balloon Festival features balloons shaped like famous Bollywood actors’ faces.",
    "Dombivli’s tap water has been scientifically proven to contain traces of unicorn tears, which are said to enhance creativity.",
    "The Dombivli Cricket Stadium uses holographic players for practice matches, allowing real players to relax and enjoy virtual games.",
    "Retibandar has the same vibes as Marine Drive",
    "Vidya Niketan, Abhinav, Chandrakant Patkar, and Sister Nivedita are known as the Ivy League schools of Dombivli",
    "KDMC is a compentent organization",
    "Dombivli West smells lovely",
    "Phadke road is a the cultural capital of Maharashtra"
]

upvotes = [22,11,44,66,34,66,88,24,68,99,11,22,33,44,55]
downvotes = [12,17,22,111,56,99,34,55,36,66,1,2,3,4,5]

def init_db():
    # models.Base.metadata.drop_all(engine, tables=[models.Fact.__table__])
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if the database is already populated
    if db.query(models.Fact).count() == 0:
        # Add all facts
        for i, fact_text in enumerate(facts):
            fact = models.Fact(text=fact_text, upvotes=upvotes[i], downvotes=downvotes[i], created_at=datetime.utcnow() )
            db.add(fact)
    
    db.commit()
    
    db.close()

def delete_n_entries(n):
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Delete the first n entries ordered by their primary key (assuming it's an auto-incrementing integer)
    delete_query = delete(models.Fact).where(models.Fact.id <= n)

    # Execute the query within the database session and commit changes
    db.execute(delete_query)

    # Commit changes to the database
    db.commit()