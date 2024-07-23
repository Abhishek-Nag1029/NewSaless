import pymongo

# Define your MongoDB connection string
DATABASE_URL = "mongodb+srv://saurabh021120:1asaurabh@cluster0.wavnsdt.mongodb.net/CompanyDB"

# Connect to MongoDB
client = pymongo.MongoClient(DATABASE_URL)
db = client.get_database()

# Access the "admin" collection
admin_collection = db["admin"]

# Define indexes
# Example: Create an ascending index on the "adminId" field
admin_collection.create_index([("adminId", pymongo.ASCENDING)])

# You can create additional indexes for other fields as needed.
# For example, to create an ascending index on the "id" field:
# admin_collection.create_index([("id", pymongo.ASCENDING)])

# Close the MongoDB client
client.close()
