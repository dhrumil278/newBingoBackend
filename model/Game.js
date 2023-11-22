const mongoose = require('mongoose');
const { Schema } = mongoose;

const PlayerColor = {
  player: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  color: {
    type: String,
    required: true,
  },
  bingoBoard: {
    type: [],
  },
};
const GameSchema = mongoose.Schema(
  {
    // players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    players: [PlayerColor],
    steps: [],
    isStart: {
      type: Boolean,
      default: false,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    code: {
      type: String,
      required: true,
    },
    admin: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    bingoBoard: {
      type: [],
      required: true,
    },
    clickedBox: {
      type: [],
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('Game', GameSchema);
