import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TaskList from './pages/taskList';
import TaskForm from './pages/taskForm';
import Login from './pages/login';
import Register from './pages/register';
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (isAuth) {
      fetchTasks();
    }
  }, [isAuth]);

  const fetchTasks = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/tasks', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        return response.json();
      })
      .then(data => setTasks(data))
      .catch(error => console.error('Error fetching tasks:', error));
  };

  const addTask = (taskName) => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: taskName })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add task');
        }
        return response.json();
      })
      .then(newTask => setTasks(prevTasks => [...prevTasks, newTask]))
      .catch(error => console.error('Error adding task:', error));
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuth(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
    setTasks([]);
  };

  return (
    <div className="App">
      <h1>Task Manager</h1>
      <Routes>
        <Route
          path="/login"
          element={!isAuth ? <Login onLogin={login} /> : <Navigate to="/tasks" />}
        />
        <Route
          path="/register"
          element={!isAuth ? <Register /> : <Navigate to="/tasks" />}
        />
        <Route
          path="/tasks"
          element={isAuth ? (
            <div>
              <button onClick={logout}>Logout</button>
              <TaskForm addTask={addTask} />
              <TaskList tasks={tasks} />
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;
