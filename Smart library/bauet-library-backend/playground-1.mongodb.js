// Select or Create Database
use('bauetLibraryDB');

// Create users collection & insert sample users
db.getCollection('users').insertMany([
  {
    username: "admin",
    password: "123456",
    role: "admin",
    createdAt: new Date()
  },
  {
    username: "student1",
    password: "student123",
    role: "student",
    createdAt: new Date()
  }
]);

// Check users
db.getCollection('users').find({});