import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { Server as SocketServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { IProject } from "./models/Project";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import bodyParser = require("body-parser");
dotenv.config();

const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(
    "mongodb+srv://test:test@cluster0.856pudv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

mongoose.connection.on("connected", async () => {
  if (
    !(await mongoose.connection.db
      .listCollections({ name: "projects" })
      .hasNext())
  ) {
    await mongoose.connection.db.createCollection("projects");
    console.log("Projects collection created");
  }
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

const PORT = process.env.PORT || 5000;

interface SocketUser {
  userId: string;
  username: string;
}

// Middleware for socket authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("Received token:", token);

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    console.log("Decoded token:", decoded);
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket: Socket) => {
  console.log("A user connected");

  socket.on("join_project", async (projectId: string, user: SocketUser) => {
    try {
      const project = await mongoose.model<IProject>("Project").findOne({
        _id: projectId,
        $or: [
          { owner: socket.data.userId },
          { collaborators: socket.data.userId },
        ],
      });

      if (!project) {
        socket.emit("error", "You don't have access to this project");
        return;
      }

      socket.join(projectId);
      socket.to(projectId).emit("user_joined", user);
      console.log(`User ${user.username} joined project ${projectId}`);
    } catch (error) {
      console.error("Error joining project:", error);
      socket.emit("error", "Error joining project");
    }
  });

  socket.on("leave_project", async (projectId: string, user: SocketUser) => {
    socket.leave(projectId);
    socket.to(projectId).emit("user_left", user);
  });

  socket.on("code_change", async (projectId: string, content: string) => {
    // console.log(`Code change in project ${projectId}`);
    io.to(projectId).emit("code_updated", content);
    try {
      await mongoose.model<IProject>("Project").findOneAndUpdate(
        {
          _id: projectId,
          $or: [
            { owner: socket.data.userId },
            { collaborators: socket.data.userId },
          ],
        },
        { content, updatedAt: Date.now() }
      );
    } catch (error) {
      console.error("Error updating project:", error);
      socket.emit("error", "Error updating project");
    }
  });

  socket.on(
    "chat_message",
    (projectId: string, message: string, user: SocketUser) => {
      io.to(projectId).emit("new_message", { message, user });
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
