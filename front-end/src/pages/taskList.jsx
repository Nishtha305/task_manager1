import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const fetchedToken = localStorage.getItem('token');
    setToken(fetchedToken);
    const fetchTasks = async () => {
      if (!fetchedToken) {
        console.error('No token provided');
        setError('No token provided');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/tasks', {
          headers: {
            'Authorization': `Bearer ${fetchedToken}`,
            'Content-Type': 'application/json'
          }
        });

        // Deduplicate tasks based on 'name'
        const uniqueTasks = Array.from(new Set(response.data.map(task => task.name)))
          .map(name => response.data.find(task => task.name === name));
        
        setTasks(uniqueTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(error.response?.data?.message || error.message);
      }
    };

    fetchTasks();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="task-list">
      <h2>Task List</h2>
      <ul className="task-list-items">
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <li key={index}>{task.name}</li>
          ))
        ) : (
          <li>No tasks available.</li>
        )}
      </ul>
    </div>
  );
};

export default TaskList;
