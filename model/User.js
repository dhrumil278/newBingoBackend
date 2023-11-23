const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    games: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('User', UserSchema);
