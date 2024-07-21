// Project.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  content: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: "User" }],
  content: { type: String, default: "" },
  language: { type: String, default: "javascript" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProject>("Project", ProjectSchema);
