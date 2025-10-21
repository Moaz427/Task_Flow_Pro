import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskProvider, useTasks } from './context/TaskContext';
import { useTaskManager, useTaskFilter, useKeyboardShortcuts, useTheme, useDragAndDrop } from './hooks/useTaskManager';
import { TaskItem, AddTask, FilterBar } from './components/TaskComponents';
import { Header, SearchBar, StatisticsDashboard, SettingsPanel, DataManagement } from './components/AppComponents';
import { ToastContainer, ConfirmDialog } from './components/UI';
import ErrorBoundary from './components/UI';
import './App.css';

// Toast management hook
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};

// Main App Content Component
const AppContent = () => {
  const { state, dispatch } = useTasks();
  const { createTask, toggleTask, updateTask, deleteTask, reorderTasks, clearCompleted, taskStats } = useTaskManager();
  const { filteredTasks, filter, searchTerm, setFilter, setSearchTerm } = useTaskFilter();
  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, removeToast } = useToast();

  // Modal states
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Drag and drop functionality
  const { draggedItem, dragOverItem, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd } = useDragAndDrop(state.tasks, reorderTasks);

  // Enhanced task creation
  const handleAddTask = (text, options = {}) => {
    try {
      createTask(text, options);
      addToast('Task added successfully!', 'success');
    } catch (error) {
      addToast('Failed to add task', 'error');
    }
  };

  // Enhanced task toggle
  const handleToggleTask = (id) => {
    try {
      toggleTask(id);
      const task = state.tasks.find(t => t.id === id);
      addToast(`Task ${task?.completed ? 'completed' : 'marked as active'}!`, 'success');
    } catch (error) {
      addToast('Failed to update task', 'error');
    }
  };

  // Enhanced task update
  const handleUpdateTask = (id, updates) => {
    try {
      updateTask(id, updates);
      addToast('Task updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update task', 'error');
    }
  };

  // Enhanced task deletion
  const handleDeleteTask = (id) => {
    try {
      deleteTask(id);
      addToast('Task deleted successfully!', 'success');
    } catch (error) {
      addToast('Failed to delete task', 'error');
    }
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    try {
      clearCompleted();
      addToast('Completed tasks cleared!', 'success');
      setShowConfirmClear(false);
    } catch (error) {
      addToast('Failed to clear completed tasks', 'error');
    }
  };

  // Import tasks
  const handleImportTasks = (importedTasks) => {
    try {
      dispatch({ type: 'SET_TASKS', payload: importedTasks });
      addToast(`Imported ${importedTasks.length} tasks successfully!`, 'success');
    } catch (error) {
      addToast('Failed to import tasks', 'error');
    }
  };

  // Update settings
  const handleUpdateSettings = (newSettings) => {
    try {
      dispatch({ type: 'SET_SETTINGS', payload: newSettings });
      addToast('Settings updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update settings', 'error');
    }
  };

  // Keyboard shortcuts info
  useEffect(() => {
    const handleHelp = (e) => {
      if (e.key === '?' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        addToast('Keyboard shortcuts: Ctrl+K (Search), Ctrl+N (New task), Ctrl+1-5 (Filters), Esc (Clear)', 'info', 5000);
      }
    };

    document.addEventListener('keydown', handleHelp);
    return () => document.removeEventListener('keydown', handleHelp);
  }, [addToast]);

  return (
    <div className="app">
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Header
          taskStats={taskStats}
          onShowStats={() => setShowStats(true)}
          onShowSettings={() => setShowSettings(true)}
          onShowDataManagement={() => setShowDataManagement(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <motion.div
          className="main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <AddTask onAdd={handleAddTask} />

          {state.tasks.length > 0 && (
            <>
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />

              <FilterBar
                filter={filter}
                onFilterChange={setFilter}
                taskStats={taskStats}
              />

              <div className="task-list">
                <AnimatePresence>
                  {filteredTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onEdit={() => {}}
                      onDelete={handleDeleteTask}
                      onUpdate={handleUpdateTask}
                      isDragging={draggedItem === task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragOver={(e) => handleDragOver(e, task.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, task.id)}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {taskStats.completed > 0 && (
                <motion.button
                  className="clear-completed"
                  onClick={() => setShowConfirmClear(true)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Completed ({taskStats.completed})
                </motion.button>
              )}
            </>
          )}

          {state.tasks.length === 0 && (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="empty-icon">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  📝
                </motion.div>
              </div>
              <h3>No tasks yet</h3>
              <p>Add your first task above to get started!</p>
              <div className="empty-hints">
                <p>💡 <strong>Tip:</strong> Press Ctrl+K to search, Ctrl+N for new task</p>
                <p>🎯 <strong>Tip:</strong> Use categories and priorities to organize better</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Modals */}
      <StatisticsDashboard
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        taskStats={taskStats}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={state.settings}
        onUpdateSettings={handleUpdateSettings}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <DataManagement
        isOpen={showDataManagement}
        onClose={() => setShowDataManagement(false)}
        tasks={state.tasks}
        onImportTasks={handleImportTasks}
      />

      <ConfirmDialog
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={handleClearCompleted}
        title="Clear Completed Tasks"
        message={`Are you sure you want to clear ${taskStats.completed} completed tasks? This action cannot be undone.`}
        confirmText="Clear All"
        cancelText="Cancel"
      />

      {/* Toast Container */}
      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
      />
    </div>
  );
};

// Main App Component with Provider
const App = () => {
  return (
    <ErrorBoundary>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </ErrorBoundary>
  );
};

export default App;
