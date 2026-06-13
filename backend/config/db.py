import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("AnimAI.db")

MONGO_URI = os.getenv("MONGO_URI")

class MockCollection:
    """Mock MongoDB Collection for in-memory operations if MongoDB is unavailable."""
    def __init__(self, name):
        self.name = name
        self._data = []

    async def insert_one(self, document):
        self._data.append(document)
        return type('InsertResult', (), {'inserted_id': document.get('_id', 'mock_id')})()

    async def find_one(self, query):
        for doc in self._data:
            if all(doc.get(k) == v for k, v in query.items()):
                return doc
        return None

    def find(self, query=None):
        query = query or {}
        results = []
        for doc in self._data:
            if all(doc.get(k) == v for k, v in query.items()):
                results.append(doc)
        
        class MockCursor:
            def __init__(self, data):
                self.data = data
                self.index = 0
            
            def sort(self, key, direction=-1):
                # Simple sort by key (e.g. timestamp)
                try:
                    self.data = sorted(self.data, key=lambda x: x.get(key, ""), reverse=(direction == -1))
                except Exception:
                    pass
                return self
            
            def limit(self, n):
                self.data = self.data[:n]
                return self

            async def to_list(self, length):
                return self.data[:length]

            def __aiter__(self):
                self.index = 0
                return self

            async def __anext__(self):
                if self.index < len(self.data):
                    val = self.data[self.index]
                    self.index += 1
                    return val
                else:
                    raise StopAsyncIteration

        return MockCursor(results if query else list(self._data))

    async def count_documents(self, query):
        return len(self._data)


class MockDatabase:
    """Mock MongoDB Database that returns MockCollections."""
    def __init__(self):
        self._collections = {}

    def __getitem__(self, name):
        if name not in self._collections:
            self._collections[name] = MockCollection(name)
        return self._collections[name]


db_client = None
db = MockDatabase()
is_mock = True

async def verify_database_connection():
    """Pings MongoDB Atlas remote cluster and sets up the active database."""
    global db_client, db, is_mock
    if MONGO_URI:
        try:
            logger.info("Initializing MongoDB Atlas connection pool...")
            db_client = AsyncIOMotorClient(MONGO_URI)
            # Ping remote cluster
            await db_client.admin.command('ping')
            db = db_client.get_database("animai")
            is_mock = False
            logger.info("🚀 Database Mapping Verification Success: Connected to MongoDB Atlas 'animai' database smoothly.")
            print("🚀 Database Mapping Verification Success: Connected to MongoDB Atlas 'animai' database smoothly.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB Atlas: {e}. Falling back to in-memory MockDatabase.")
            db = MockDatabase()
            is_mock = True
    else:
        logger.warning("MONGO_URI not configured. Falling back to in-memory MockDatabase.")
        db = MockDatabase()
        is_mock = True

def get_database():
    """Returns the connected Motor database or the in-memory mock database."""
    global db
    if db is None:
        db = MockDatabase()
    return db
