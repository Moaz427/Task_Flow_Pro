import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Task Context for global state management
const TaskContext = createContext();

// Task reducer for state management
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        lastUpdated: new Date().toISOString()
      };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload ? { ...task, completed: !task.completed } : task
        ),
        lastUpdated: new Date().toISOString()
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
        ),
        lastUpdated: new Date().toISOString()
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };
    case 'REORDER_TASKS':
      return {
        ...state,
        tasks: action.payload,
        lastUpdated: new Date().toISOString()
      };
    case 'CLEAR_COMPLETED':
      return {
        ...state,
        tasks: state.tasks.filter(task => !task.completed),
        lastUpdated: new Date().toISOString()
      };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        lastUpdated: new Date().toISOString()
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  tasks: [],
  filter: 'all',
  searchTerm: '',
  theme: 'light',
  settings: {
    animations: true,
    soundEffects: false,
    autoSave: true,
    showCompletedCount: true,
    compactMode: false
  },
  lastUpdated: null
};

// Task Provider component
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('taskflow-pro-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'SET_TASKS', payload: parsedData.tasks || [] });
        dispatch({ type: 'SET_THEME', payload: parsedData.theme || 'light' });
        dispatch({ type: 'SET_SETTINGS', payload: parsedData.settings || initialState.settings });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (state.tasks.length > 0 || state.lastUpdated) {
      const dataToSave = {
        tasks: state.tasks,
        theme: state.theme,
        settings: state.settings,
        lastUpdated: state.lastUpdated
      };
      localStorage.setItem('taskflow-pro-data', JSON.stringify(dataToSave));
    }
  }, [state.tasks, state.theme, state.settings, state.lastUpdated]);

  const value = {
    state,
    dispatch,
    // Action creators
    addTask: (taskData) => dispatch({ type: 'ADD_TASK', payload: taskData }),
    toggleTask: (id) => dispatch({ type: 'TOGGLE_TASK', payload: id }),
    updateTask: (id, updates) => dispatch({ type: 'UPDATE_TASK', payload: { id, updates } }),
    deleteTask: (id) => dispatch({ type: 'DELETE_TASK', payload: id }),
    reorderTasks: (tasks) => dispatch({ type: 'REORDER_TASKS', payload: tasks }),
    clearCompleted: () => dispatch({ type: 'CLEAR_COMPLETED' }),
    setFilter: (filter) => dispatch({ type: 'SET_FILTER', payload: filter }),
    setSearchTerm: (term) => dispatch({ type: 'SET_SEARCH', payload: term }),
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    updateSettings: (settings) => dispatch({ type: 'SET_SETTINGS', payload: settings })
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use task context
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
