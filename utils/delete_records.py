from sqlalchemy import delete
from app.database import SessionLocal
from app.models import models

def delete_n_entries(db: SessionLocal, n: int):
    # Delete the first n entries ordered by their primary key (assuming it's an auto-incrementing integer)
    delete(models.Fact).where(models.Fact.id <= n).execute(db)

    # Commit changes to the database
    db.commit()