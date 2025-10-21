import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';

// Custom hook for task management
export const useTaskManager = () => {
  const { state, addTask, toggleTask, updateTask, deleteTask, reorderTasks, clearCompleted } = useTasks();

  // Enhanced task creation with categories and priorities
  const createTask = useCallback((text, options = {}) => {
    const newTask = {
      id: Date.now() + Math.random(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: options.category || 'general',
      priority: options.priority || 'medium',
      dueDate: options.dueDate || null,
      tags: options.tags || [],
      notes: options.notes || '',
      estimatedTime: options.estimatedTime || null,
      actualTime: options.actualTime || null,
      subtasks: options.subtasks || [],
      attachments: options.attachments || []
    };
    addTask(newTask);
    return newTask;
  }, [addTask]);

  // Enhanced task update
  const updateTaskData = useCallback((id, updates) => {
    updateTask(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }, [updateTask]);

  // Task statistics
  const taskStats = useMemo(() => {
    const total = state.tasks.length;
    const completed = state.tasks.filter(task => task.completed).length;
    const active = total - completed;
    const overdue = state.tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      new Date(task.dueDate) < new Date()
    ).length;
    
    const byPriority = state.tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    const byCategory = state.tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      completed,
      active,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byPriority,
      byCategory
    };
  }, [state.tasks]);

  return {
    tasks: state.tasks,
    createTask,
    toggleTask,
    updateTask: updateTaskData,
    deleteTask,
    reorderTasks,
    clearCompleted,
    taskStats
  };
};

// Custom hook for filtering and searching
export const useTaskFilter = () => {
  const { state, setFilter, setSearchTerm } = useTasks();

  const filteredTasks = useMemo(() => {
    let filtered = state.tasks;

    // Apply search filter
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.text.toLowerCase().includes(searchLower) ||
        task.notes.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        task.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    switch (state.filter) {
      case 'active':
        return filtered.filter(task => !task.completed);
      case 'completed':
        return filtered.filter(task => task.completed);
      case 'overdue':
        return filtered.filter(task => 
          !task.completed && 
          task.dueDate && 
          new Date(task.dueDate) < new Date()
        );
      case 'high-priority':
        return filtered.filter(task => task.priority === 'high');
      case 'today':
        const today = new Date().toDateString();
        return filtered.filter(task => 
          task.dueDate && 
          new Date(task.dueDate).toDateString() === today
        );
      default:
        return filtered;
    }
  }, [state.tasks, state.filter, state.searchTerm]);

  return {
    filteredTasks,
    filter: state.filter,
    searchTerm: state.searchTerm,
    setFilter,
    setSearchTerm
  };
};

// Custom hook for keyboard shortcuts
export const useKeyboardShortcuts = () => {
  const { setFilter, setSearchTerm } = useTasks();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when not typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            document.querySelector('.search-input')?.focus();
            break;
          case 'n':
            e.preventDefault();
            document.querySelector('.task-input')?.focus();
            break;
          case '1':
            e.preventDefault();
            setFilter('all');
            break;
          case '2':
            e.preventDefault();
            setFilter('active');
            break;
          case '3':
            e.preventDefault();
            setFilter('completed');
            break;
          case '4':
            e.preventDefault();
            setFilter('overdue');
            break;
          case '5':
            e.preventDefault();
            setFilter('high-priority');
            break;
          default:
            break;
        }
      }

      // Escape key to clear search
      if (e.key === 'Escape') {
        setSearchTerm('');
        document.activeElement?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setFilter, setSearchTerm]);
};

// Custom hook for drag and drop
export const useDragAndDrop = (tasks, onReorder) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  const handleDragStart = (e, taskId) => {
    setDraggedItem(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e, taskId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(taskId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e, targetTaskId) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem !== targetTaskId) {
      const draggedIndex = tasks.findIndex(task => task.id === draggedItem);
      const targetIndex = tasks.findIndex(task => task.id === targetTaskId);
      
      const newTasks = [...tasks];
      const [draggedTask] = newTasks.splice(draggedIndex, 1);
      newTasks.splice(targetIndex, 0, draggedTask);
      
      onReorder(newTasks);
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return {
    draggedItem,
    dragOverItem,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  };
};

// Custom hook for theme management
export const useTheme = () => {
  const { state, setTheme } = useTasks();

  const toggleTheme = useCallback(() => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [state.theme, setTheme]);

  const applyTheme = useCallback(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  return {
    theme: state.theme,
    toggleTheme,
    isDark: state.theme === 'dark'
  };
};
