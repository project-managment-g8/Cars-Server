// server/config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbUri =
      "mongodb+srv://liavjulio7:Ll456456@social-cars.f1ttymt.mongodb.net/social_cars";
    const connect = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MONGO db connected to: " + connect.connection.name);
  } catch (err) {
    console.log(`DB Error ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
