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
    games: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('User', UserSchema);
