import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Settings, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  BarChart3,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Button, Modal, ProgressBar, Badge, Tooltip } from '../UI';
import { useTaskManager, useTaskFilter, useKeyboardShortcuts, useTheme } from '../../hooks/useTaskManager';

// Statistics Dashboard Component
export const StatisticsDashboard = ({ isOpen, onClose, taskStats }) => {
  const completionRate = taskStats.completionRate;
  const totalTasks = taskStats.total;
  const completedTasks = taskStats.completed;
  const activeTasks = taskStats.active;
  const overdueTasks = taskStats.overdue;

  const priorityStats = Object.entries(taskStats.byPriority).map(([priority, count]) => ({
    priority,
    count,
    percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
  }));

  const categoryStats = Object.entries(taskStats.byCategory).map(([category, count]) => ({
    category,
    count,
    percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Statistics" size="large">
      <div className="stats-dashboard">
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <h3>{totalTasks}</h3>
              <p>Total Tasks</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>{completionRate}%</h3>
              <p>Completion Rate</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>{activeTasks}</h3>
              <p>Active Tasks</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>{overdueTasks}</h3>
              <p>Overdue Tasks</p>
            </div>
          </div>
        </div>

        <div className="stats-charts">
          <div className="chart-section">
            <h4>Priority Distribution</h4>
            <div className="priority-chart">
              {priorityStats.map(({ priority, count, percentage }) => (
                <div key={priority} className="priority-item">
                  <div className="priority-label">
                    <span className="priority-name">{priority}</span>
                    <span className="priority-count">{count}</span>
                  </div>
                  <ProgressBar 
                    value={percentage} 
                    max={100} 
                    color={priority === 'high' ? 'danger' : priority === 'medium' ? 'warning' : 'success'}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h4>Category Distribution</h4>
            <div className="category-chart">
              {categoryStats.map(({ category, count, percentage }) => (
                <div key={category} className="category-item">
                  <div className="category-label">
                    <span className="category-name">{category}</span>
                    <span className="category-count">{count}</span>
                  </div>
                  <ProgressBar 
                    value={percentage} 
                    max={100} 
                    color="primary"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Settings Panel Component
export const SettingsPanel = ({ isOpen, onClose, settings, onUpdateSettings, theme, onToggleTheme }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings({
      animations: true,
      soundEffects: false,
      autoSave: true,
      showCompletedCount: true,
      compactMode: false
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="medium">
      <div className="settings-panel">
        <div className="settings-section">
          <h4>Appearance</h4>
          <div className="setting-item">
            <label>Theme</label>
            <Button
              variant="secondary"
              onClick={onToggleTheme}
              icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </div>

        <div className="settings-section">
          <h4>Behavior</h4>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={localSettings.animations}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  animations: e.target.checked
                })}
              />
              Enable Animations
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={localSettings.soundEffects}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  soundEffects: e.target.checked
                })}
              />
              Sound Effects
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={localSettings.autoSave}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  autoSave: e.target.checked
                })}
              />
              Auto Save
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={localSettings.showCompletedCount}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  showCompletedCount: e.target.checked
                })}
              />
              Show Completed Count
            </label>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={localSettings.compactMode}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  compactMode: e.target.checked
                })}
              />
              Compact Mode
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <Button variant="secondary" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Data Management Component
export const DataManagement = ({ isOpen, onClose, tasks, onImportTasks }) => {
  const [importData, setImportData] = useState('');
  const [exportFormat, setExportFormat] = useState('json');

  const handleExport = () => {
    const dataToExport = {
      tasks,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    let content, mimeType, filename;

    switch (exportFormat) {
      case 'json':
        content = JSON.stringify(dataToExport, null, 2);
        mimeType = 'application/json';
        filename = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case 'csv':
        const csvHeaders = 'ID,Text,Completed,CreatedAt,Category,Priority,DueDate,Tags\n';
        const csvRows = tasks.map(task => 
          `${task.id},"${task.text}",${task.completed},${task.createdAt},${task.category},${task.priority},${task.dueDate || ''},"${task.tags.join(';')}"`
        ).join('\n');
        content = csvHeaders + csvRows;
        mimeType = 'text/csv';
        filename = `taskflow-backup-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const importedData = JSON.parse(importData);
      if (importedData.tasks && Array.isArray(importedData.tasks)) {
        onImportTasks(importedData.tasks);
        setImportData('');
        alert('Tasks imported successfully!');
      } else {
        alert('Invalid import data format');
      }
    } catch (error) {
      alert('Error parsing import data: ' + error.message);
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (importedData.tasks && Array.isArray(importedData.tasks)) {
            onImportTasks(importedData.tasks);
            alert('Tasks imported successfully!');
          } else {
            alert('Invalid file format');
          }
        } catch (error) {
          alert('Error reading file: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Data Management" size="medium">
      <div className="data-management">
        <div className="data-section">
          <h4>Export Data</h4>
          <div className="export-options">
            <label>
              Export Format:
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="format-select"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </label>
            <Button
              variant="primary"
              onClick={handleExport}
              icon={<Download size={16} />}
            >
              Export Tasks
            </Button>
          </div>
        </div>

        <div className="data-section">
          <h4>Import Data</h4>
          <div className="import-options">
            <div className="file-import">
              <label>
                Import from File:
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="file-input"
                />
              </label>
            </div>
            
            <div className="text-import">
              <label>Import from Text:</label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste JSON data here..."
                className="import-textarea"
                rows="6"
              />
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={!importData.trim()}
                icon={<Upload size={16} />}
              >
                Import Tasks
              </Button>
            </div>
          </div>
        </div>

        <div className="data-info">
          <p>
            <strong>Note:</strong> Export creates a backup of all your tasks. 
            Import will replace your current tasks with the imported data.
          </p>
        </div>
      </div>
    </Modal>
  );
};

// Search Bar Component
export const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="search-bar">
      <Search className="search-icon" size={20} />
      <input
        type="text"
        placeholder="Search tasks, notes, tags..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />
      {searchTerm && (
        <button
          className="search-clear"
          onClick={() => onSearchChange('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};

// Header Component
export const Header = ({ 
  taskStats, 
  onShowStats, 
  onShowSettings, 
  onShowDataManagement,
  theme,
  onToggleTheme 
}) => {
  return (
    <header className="header">
      <div className="header-content">
        <motion.div
          className="header-left"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="title">TaskFlow Pro</h1>
          <p className="subtitle">Organize your life, one task at a time</p>
        </motion.div>

        <motion.div
          className="header-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{taskStats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{taskStats.active}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{taskStats.completionRate}%</span>
              <span className="stat-label">Complete</span>
            </div>
          </div>

          <div className="header-actions">
            <Tooltip content="Statistics">
              <Button
                variant="ghost"
                size="small"
                onClick={onShowStats}
                icon={<BarChart3 size={18} />}
              />
            </Tooltip>

            <Tooltip content="Settings">
              <Button
                variant="ghost"
                size="small"
                onClick={onShowSettings}
                icon={<Settings size={18} />}
              />
            </Tooltip>

            <Tooltip content="Data Management">
              <Button
                variant="ghost"
                size="small"
                onClick={onShowDataManagement}
                icon={<RefreshCw size={18} />}
              />
            </Tooltip>

            <Tooltip content={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              <Button
                variant="ghost"
                size="small"
                onClick={onToggleTheme}
                icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              />
            </Tooltip>
          </div>
        </motion.div>
      </div>
    </header>
  );
};
