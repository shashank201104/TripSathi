const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MongoDB URI not configured. Please check your .env file.");
    }

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Fix trips with itinerary but status is still draft
const fixTripStatuses = async () => {
  try {

    // Find all trips with status "draft" but have itinerary.days with items
    const result = await mongoose.connection.db
      .collection("trips")
      .updateMany(
        {
          status: "draft",
          "itinerary.days": { $exists: true, $not: { $size: 0 } }
        },
        {
          $set: { status: "upcoming" }
        }
      );


    // Get count of trips by status after fix
    const statusCounts = await mongoose.connection.db
      .collection("trips")
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

   

  } catch (error) {
    console.error("Fix error:", error);
    throw error;
  }
};

// Run fix
const runFix = async () => {
  try {
    await connectDB();
    await fixTripStatuses();
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Fix failed:", error);
    process.exit(1);
  }
};

runFix();
