print("Testing imports...")
import os
print("Imported os")
import logging
print("Imported logging")
from config.db import get_database, is_mock, verify_database_connection
print("Imported db config")
from routes.incidents import router as triage_router
print("Imported incidents router")
print("All imports successful!")
