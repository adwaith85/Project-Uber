import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const DriverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      // trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    number: {
      type: String,
      trim: true,
    },
    profileimg: {
      type: String,
      default: null,
    },
    carnumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// ✅ Hash password only if it's modified or new
DriverSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Method to compare passwords
DriverSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Hide password when converting to JSON
DriverSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const DriverModel = mongoose.model("Driver", DriverSchema);
export default DriverModel;
