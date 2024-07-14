from sqlalchemy import create_engine, MetaData

# Replace this with your actual database URL
DATABASE_URL = "postgresql://user:password@db:5432/database_name"

# Create an engine
engine = create_engine(DATABASE_URL)

# Create a MetaData instance
metadata = MetaData()

# Reflect the existing tables
metadata.reflect(bind=engine)

# Drop the 'facts' table if it exists
if 'facts' in metadata.tables:
    facts_table = metadata.tables['facts']
    facts_table.drop(engine)
    print("Dropped 'facts' table.")
else:
    print("'facts' table does not exist.")
