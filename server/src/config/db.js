import mongoose from "mongoose";

export async function connectDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error("MONGODB_URI is required. Copy server/.env.example to server/.env.");
  }

  mongoose.set("strictQuery", true);
  const connection = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
