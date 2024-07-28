// server/config/db.js
import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const dbUri =
      "mongodb+srv://liavjulio7:Ll456456@social-cars.f1ttymt.mongodb.net/social_cars";
    const connect = await mongoose.connect(dbUri);
    console.log("MONGO db connect to: " + connect.connection.name);
  } catch (err) {
    console.log(`db Error ${err.message}`);
    process.exit(1);
  }
};
export default connectDB;
