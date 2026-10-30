
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Task Schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Task Model
const Task = mongoose.model("Task", taskSchema);

// GET - Fetch all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Could not fetch tasks." });
  }
});

// POST - Add a new task
app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required.",
      });
    }

    const newTask = new Task({
      title: title.trim(),
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ message: "Could not create task." });
  }
});

// PATCH - Update task status
app.patch("/tasks/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Pending", "Ongoing", "Completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status.",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Could not update task." });
  }
});

// DELETE - Delete a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully.",
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Could not delete task." });
  }
});

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is missing.");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB Atlas connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
