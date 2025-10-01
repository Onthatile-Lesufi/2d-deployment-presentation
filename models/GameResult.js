import mongoose from 'mongoose';

const gameResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    details: {
      timeTaken: {
        type: Number, // in seconds
        required: false,
      },
      attempts: {
        type: Number,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

const GameResult = mongoose.model('GameResult', gameResultSchema);

export default GameResult;
