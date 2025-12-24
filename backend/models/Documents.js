import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    required: true,
  },
  chunkText: { type: String, required: true },
  embedding: {
    type: [Number],
    required: true,
  },
});

export default mongoose.model("Document", documentSchema);
