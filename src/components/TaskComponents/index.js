import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Tag, 
  Flag, 
  Clock, 
  CheckCircle, 
  Circle, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Paperclip,
  MessageSquare,
  Star,
  AlertCircle
} from 'lucide-react';
import { Button, Badge, Tooltip, Modal, ConfirmDialog } from '../UI';
import { useTaskManager, useTaskFilter } from '../../hooks/useTaskManager';

// Priority colors and icons
const PRIORITY_CONFIG = {
  low: { color: 'green', icon: '🟢', label: 'Low' },
  medium: { color: 'yellow', icon: '🟡', label: 'Medium' },
  high: { color: 'red', icon: '🔴', label: 'High' },
  urgent: { color: 'purple', icon: '🚨', label: 'Urgent' }
};

// Category colors
const CATEGORY_CONFIG = {
  work: { color: 'blue', icon: '💼' },
  personal: { color: 'green', icon: '🏠' },
  health: { color: 'red', icon: '🏥' },
  education: { color: 'purple', icon: '📚' },
  finance: { color: 'yellow', icon: '💰' },
  general: { color: 'gray', icon: '📝' }
};

// Enhanced Task Item Component
export const TaskItem = ({ task, onToggle, onEdit, onDelete, onUpdate, isDragging = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showDetails, setShowDetails] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const editInputRef = useRef(null);

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const category = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.general;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(task.text);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(task.id, { text: editText.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(task.text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isDragging ? 1.05 : 1,
        rotate: isDragging ? 2 : 0
      }}
      exit={{ opacity: 0, y: -20 }}
      className={`task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isDragging ? 'dragging' : ''}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="task-content">
        <div className="task-main">
          <button
            className="task-toggle"
            onClick={() => onToggle(task.id)}
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.completed ? (
              <CheckCircle className="check-icon" />
            ) : (
              <Circle className="circle-icon" />
            )}
          </button>

          <div className="task-info">
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyPress}
                className="edit-input"
              />
            ) : (
              <div className="task-text-container">
                <span className="task-text">{task.text}</span>
                {task.notes && (
                  <span className="task-notes">{task.notes}</span>
                )}
              </div>
            )}

            <div className="task-meta">
              <div className="task-badges">
                <Badge variant={priority.color} size="small">
                  {priority.icon} {priority.label}
                </Badge>
                <Badge variant={category.color} size="small">
                  {category.icon} {task.category}
                </Badge>
                {task.dueDate && (
                  <Badge variant={isOverdue ? 'danger' : 'info'} size="small">
                    <Calendar size={12} />
                    {formatDate(task.dueDate)}
                  </Badge>
                )}
                {task.tags.length > 0 && (
                  <Badge variant="secondary" size="small">
                    <Tag size={12} />
                    {task.tags.length}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="task-actions">
          <Tooltip content="More options">
            <button
              className="action-btn more-btn"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVertical size={16} />
            </button>
          </Tooltip>

          <AnimatePresence>
            {showActions && (
              <motion.div
                className="action-menu"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <button
                  className="action-menu-item"
                  onClick={handleEdit}
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  className="action-menu-item"
                  onClick={() => setShowDetails(true)}
                >
                  <MessageSquare size={14} />
                  Details
                </button>
                <button
                  className="action-menu-item danger"
                  onClick={handleDelete}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Task Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Task Details"
        size="medium"
      >
        <div className="task-details">
          <div className="detail-section">
            <h4>Description</h4>
            <p>{task.text}</p>
          </div>
          
          {task.notes && (
            <div className="detail-section">
              <h4>Notes</h4>
              <p>{task.notes}</p>
            </div>
          )}

          <div className="detail-grid">
            <div className="detail-item">
              <h4>Priority</h4>
              <Badge variant={priority.color}>
                {priority.icon} {priority.label}
              </Badge>
            </div>
            
            <div className="detail-item">
              <h4>Category</h4>
              <Badge variant={category.color}>
                {category.icon} {task.category}
              </Badge>
            </div>
            
            {task.dueDate && (
              <div className="detail-item">
                <h4>Due Date</h4>
                <p>{new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
            )}
            
            <div className="detail-item">
              <h4>Created</h4>
              <p>{new Date(task.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {task.tags.length > 0 && (
            <div className="detail-section">
              <h4>Tags</h4>
              <div className="tags-list">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" size="small">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  );
};

// Enhanced Add Task Component
export const AddTask = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim(), {
        notes: notes.trim(),
        category,
        priority,
        dueDate: dueDate || null,
        tags: tags.filter(tag => tag.trim())
      });
      
      // Reset form
      setText('');
      setNotes('');
      setCategory('general');
      setPriority('medium');
      setDueDate('');
      setTags([]);
      setTagInput('');
      setIsExpanded(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.name === 'tagInput') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <motion.div
      className="add-task"
      initial={false}
      animate={{ height: 'auto' }}
    >
      <form onSubmit={handleSubmit} className="add-task-form">
        <div className="input-group">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Add a new task..."
            className="task-input"
            name="text"
          />
          <Button
            type="submit"
            variant="primary"
            size="medium"
            disabled={!text.trim()}
            icon={<Plus size={20} />}
          >
            Add
          </Button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="task-options"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="options-grid">
                <div className="option-group">
                  <label>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="option-select"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {key.charAt(0).toUpperCase() + key.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="option-group">
                  <label>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="option-select"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="option-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="option-input"
                  />
                </div>
              </div>

              <div className="notes-section">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="notes-input"
                  rows="2"
                />
              </div>

              <div className="tags-section">
                <label>Tags</label>
                <div className="tags-input-group">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tags..."
                    className="tag-input"
                    name="tagInput"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                  >
                    Add Tag
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="tags-list">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        size="small"
                        animated
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="tag-remove"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

// Enhanced Filter Bar Component
export const FilterBar = ({ filter, onFilterChange, taskStats }) => {
  const filters = [
    { key: 'all', label: 'All', count: taskStats.total, icon: '📋' },
    { key: 'active', label: 'Active', count: taskStats.active, icon: '⚡' },
    { key: 'completed', label: 'Completed', count: taskStats.completed, icon: '✅' },
    { key: 'overdue', label: 'Overdue', count: taskStats.overdue, icon: '⚠️' },
    { key: 'high-priority', label: 'High Priority', count: taskStats.byPriority.high || 0, icon: '🔴' },
    { key: 'today', label: 'Today', count: 0, icon: '📅' }
  ];

  return (
    <div className="filter-bar">
      <div className="filter-tabs">
        {filters.map(({ key, label, count, icon }) => (
          <motion.button
            key={key}
            className={`filter-tab ${filter === key ? 'active' : ''}`}
            onClick={() => onFilterChange(key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="filter-icon">{icon}</span>
            <span className="filter-label">{label}</span>
            <Badge variant="secondary" size="small">
              {count}
            </Badge>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
