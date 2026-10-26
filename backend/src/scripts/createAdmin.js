
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

async function createAdmin() {
  try {
    const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
      process.env;

    if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "Missing MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD in .env"
      );
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role !== "admin") {
        throw new Error(
          "This email already belongs to a non-admin user. Use a different ADMIN_EMAIL."
        );
      }

      console.log("An admin account with this email already exists.");
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.create({
      name: ADMIN_NAME.trim(),
      email,
      passwordHash,
      role: "admin",
      isActive: true,
    });

    console.log("Admin account created successfully.");
    console.log(`Admin email: ${email}`);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

createAdmin();
