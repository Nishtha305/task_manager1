import React, { useState, useCallback } from 'react';
import axios from 'axios';

const TaskForm = ({ addTask }) => {
  const [taskName, setTaskName] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

const handleSubmit = async (event) => {
  event.preventDefault();
  
  if (isSubmitting) return;

  if (!taskName.trim()) {
    setError('Task name cannot be empty.');
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await fetch('http://localhost:5000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name: taskName })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const newTask = await response.json();
    addTask(newTask);
    setTaskName(''); 
    setError(null);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="task-form">
      <h2>Add a New Task</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <button type="submit" disabled={isSubmitting}>Add Task</button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default TaskForm;
