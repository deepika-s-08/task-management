
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API_URL = "https://task-management-7olc.onrender.com/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
      setError("");
    } catch (err) {
      setError("Backend connect aagala. Server running-la irukka-nu check pannunga.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add task
  const createTask = async () => {
    if (!title.trim()) {
      setError("Please enter a task name.");
      setSuccess("");
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        title: title.trim()
      });

      setTasks((prev) => [...prev, response.data]);
      setTitle("");
      setError("");
      setSuccess("Task added successfully!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Could not add task. Please check backend.");
      setSuccess("");
      console.error(err);
    }
  };

  // Update task status
  const updateTaskStatus = async (id, status) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, {
        status
      });

      setTasks((prev) =>
        prev.map((task) =>
          task._id === id ? response.data : task
        )
      );

      setError("");
      setSuccess("Task status updated!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Could not update task status.");
      console.error(err);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);

      setTasks((prev) =>
        prev.filter((task) => task._id !== id)
      );

      setError("");
      setSuccess("Task deleted successfully!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Could not delete task.");
      console.error(err);
    }
  };

  // Task counts
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;
  const ongoingTasks = tasks.filter(
    (task) => task.status === "Ongoing"
  ).length;
  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  return (
    <div className="container dashboard-container">

      {/* Header */}
      <header className="top-header">
        <div className="brand">
          <div className="brand-icon">✓</div>
          <div>
            <h2>TaskFlow</h2>
            <p>Task Management Dashboard</p>
          </div>
        </div>

        <div className="workspace">
          <span className="green-dot"></span>
          Workspace
        </div>
      </header>

      <main className="dashboard-content">

        {/* Welcome Banner */}
        <section className="dashboard-header">
          <div>
            <p className="small-title">YOUR WORKSPACE</p>
            <h2>Manage your tasks</h2>
            <p>Organize your work, track progress, and get things done.</p>
          </div>

          <div className="banner-icon">✓</div>
        </section>

        {/* Statistics */}
        <div className="row stats-row">

          <div className="col-md-3 col-6">
            <div className="stats-card total-card">
              <p>Total Tasks</p>
              <h2>{totalTasks}</h2>
              <span>All your tasks</span>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="stats-card pending-card">
              <p>Pending</p>
              <h2>{pendingTasks}</h2>
              <span>Waiting to start</span>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="stats-card ongoing-card">
              <p>Ongoing</p>
              <h2>{ongoingTasks}</h2>
              <span>Currently in progress</span>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="stats-card completed-card">
              <p>Completed</p>
              <h2>{completedTasks}</h2>
              <span>Successfully finished</span>
            </div>
          </div>

        </div>

        {/* Add Task Section */}
        <section className="task-section">

          <h3>Add a new task</h3>
          <p className="section-description">
            Create a task to keep your work organized.
          </p>

          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter your task name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createTask();
              }}
            />

            <button
              className="btn btn-primary"
              onClick={createTask}
            >
              + Add Task
            </button>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

        </section>

        {/* My Tasks */}
        <section className="task-section">

          <div className="tasks-heading">
            <div>
              <h3>My Tasks</h3>
              <p className="section-description">
                View and update your tasks below.
              </p>
            </div>

            <button
              className="btn refresh-btn"
              onClick={fetchTasks}
            >
              ↻ Refresh
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h5>No tasks yet</h5>
              <p>Add your first task using the form above.</p>
            </div>
          ) : (
            <div className="task-list">

              {tasks.map((task) => (
                <div className="task-item" key={task._id}>

                  <div className="task-info">
                    <div className={`task-check ${
                      task.status === "Completed" ? "checked" : ""
                    }`}>
                      {task.status === "Completed" ? "✓" : ""}
                    </div>

                    <div>
                      <h6 className={
                        task.status === "Completed" ? "completed-title" : ""
                      }>
                        {task.title}
                      </h6>

                      <span className={`status-badge status-${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <div className="task-actions">

                    <select
                      className="form-select status-select"
                      value={task.status}
                      onChange={(e) =>
                        updateTaskStatus(task._id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <button
                      className="btn btn-danger delete-btn"
                      onClick={() => deleteTask(task._id)}
                    >
                      Delete
                    </button>

                  </div>
                </div>
              ))}

            </div>
          )}

        </section>

      </main>

      {/* Footer */}
      <footer className="footer">
        TaskFlow · Task Management System
      </footer>

    </div>
  );
}

export default App;
