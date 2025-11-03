import { Task } from './types';

/**
 * Public utility functions for Gantt operations
 * Similar to DHTMLX gantt.* utility methods
 */
export const ganttUtils = {
  /**
   * Calculate end date based on start date and duration in days
   * @param start - Start date
   * @param durationDays - Duration in days
   * @returns End date
   */
  calculateEndDate: (start: Date, durationDays: number): Date => {
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);
    return end;
  },

  /**
   * Calculate duration in days between two dates
   * @param start - Start date
   * @param end - End date
   * @returns Duration in days (rounded up)
   */
  calculateDuration: (start: Date, end: Date): number => {
    const diffMs = end.getTime() - start.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  },

  /**
   * Calculate working days between two dates (excluding weekends)
   * @param start - Start date
   * @param end - End date
   * @returns Number of working days
   */
  calculateWorkingDays: (start: Date, end: Date): number => {
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  },

  /**
   * Add working days to a date (excluding weekends)
   * @param start - Start date
   * @param workingDays - Number of working days to add
   * @returns End date
   */
  addWorkingDays: (start: Date, workingDays: number): Date => {
    const result = new Date(start);
    let daysAdded = 0;

    while (daysAdded < workingDays) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }

    return result;
  },

  /**
   * Check if a date is a weekend
   * @param date - Date to check
   * @returns True if weekend
   */
  isWeekend: (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  },

  /**
   * Validate if creating a dependency would create a circular reference
   * Uses Depth-First Search (DFS) algorithm
   * @param tasks - All tasks
   * @param fromTaskId - Source task ID
   * @param toTaskId - Target task ID
   * @returns True if would create circular dependency
   */
  validateDependencies: (tasks: Task[], fromTaskId: string, toTaskId: string): boolean => {
    // Build dependency map
    const dependencyMap = new Map<string, string[]>();

    const buildMap = (taskList: Task[]) => {
      taskList.forEach(task => {
        if (task.dependencies) {
          dependencyMap.set(task.id, task.dependencies);
        }
        if (task.subtasks) {
          buildMap(task.subtasks);
        }
      });
    };

    buildMap(tasks);

    // Simulate adding the new dependency
    const existingDeps = dependencyMap.get(toTaskId) || [];
    dependencyMap.set(toTaskId, [...existingDeps, fromTaskId]);

    // DFS to detect cycle
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (taskId: string): boolean => {
      if (!visited.has(taskId)) {
        visited.add(taskId);
        recStack.add(taskId);

        const deps = dependencyMap.get(taskId) || [];
        for (const depId of deps) {
          if (!visited.has(depId) && hasCycle(depId)) {
            return true;
          } else if (recStack.has(depId)) {
            return true;
          }
        }
      }
      recStack.delete(taskId);
      return false;
    };

    return hasCycle(toTaskId);
  },

  /**
   * Flatten nested tasks into a single array
   * @param tasks - Tasks with potential subtasks
   * @returns Flat array of all tasks
   */
  flattenTasks: (tasks: Task[]): Task[] => {
    const result: Task[] = [];

    const flatten = (taskList: Task[]) => {
      taskList.forEach(task => {
        result.push(task);
        if (task.subtasks && task.subtasks.length > 0) {
          flatten(task.subtasks);
        }
      });
    };

    flatten(tasks);
    return result;
  },

  /**
   * Find a task by ID in nested structure
   * @param tasks - Tasks to search
   * @param taskId - ID to find
   * @returns Task if found, undefined otherwise
   */
  findTaskById: (tasks: Task[], taskId: string): Task | undefined => {
    for (const task of tasks) {
      if (task.id === taskId) {
        return task;
      }
      if (task.subtasks) {
        const found = ganttUtils.findTaskById(task.subtasks, taskId);
        if (found) return found;
      }
    }
    return undefined;
  },

  /**
   * Get all parent tasks recursively
   * @param tasks - All tasks
   * @param taskId - Child task ID
   * @returns Array of parent tasks
   */
  getParentTasks: (tasks: Task[], taskId: string): Task[] => {
    const parents: Task[] = [];
    const task = ganttUtils.findTaskById(tasks, taskId);

    if (!task || !task.parentId) return parents;

    let currentId: string | undefined = task.parentId;
    while (currentId) {
      const parent = ganttUtils.findTaskById(tasks, currentId);
      if (parent) {
        parents.unshift(parent);
        currentId = parent.parentId;
      } else {
        break;
      }
    }

    return parents;
  },

  /**
   * Export tasks to JSON string
   * @param tasks - Tasks to export
   * @returns JSON string
   */
  exportToJSON: (tasks: Task[]): string => {
    return JSON.stringify(tasks, null, 2);
  },

  /**
   * Import tasks from JSON string
   * @param json - JSON string
   * @returns Parsed tasks
   */
  importFromJSON: (json: string): Task[] => {
    try {
      const parsed = JSON.parse(json);

      // Validate it's an array
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid JSON: expected an array of tasks');
      }

      // Basic validation of task structure
      parsed.forEach((task, index) => {
        if (!task.id || !task.name) {
          throw new Error(`Invalid task at index ${index}: missing required fields (id, name)`);
        }
      });

      return parsed;
    } catch (error) {
      throw new Error(`Failed to import tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Export tasks to CSV format
   * @param tasks - Tasks to export
   * @returns CSV string
   */
  exportToCSV: (tasks: Task[]): string => {
    const flat = ganttUtils.flattenTasks(tasks);

    // CSV Headers
    const headers = ['ID', 'Name', 'Start Date', 'End Date', 'Progress', 'Status', 'Dependencies'];
    const rows: string[] = [headers.join(',')];

    // CSV Data
    flat.forEach(task => {
      const row = [
        task.id,
        `"${task.name.replace(/"/g, '""')}"`, // Escape quotes in name
        task.startDate ? task.startDate.toISOString().split('T')[0] : '',
        task.endDate ? task.endDate.toISOString().split('T')[0] : '',
        task.progress.toString(),
        task.status || '',
        task.dependencies?.join(';') || '',
      ];
      rows.push(row.join(','));
    });

    return rows.join('\n');
  },

  /**
   * Format date to string (YYYY-MM-DD)
   * @param date - Date to format
   * @returns Formatted string
   */
  formatDate: (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Parse date from string (YYYY-MM-DD)
   * @param dateString - Date string
   * @returns Parsed Date
   */
  parseDate: (dateString: string): Date => {
    return new Date(dateString);
  },

  /**
   * Get date range for a task
   * @param task - Task to get range for
   * @returns Object with start and end dates, or null if no dates
   */
  getTaskDateRange: (task: Task): { start: Date; end: Date } | null => {
    if (!task.startDate || !task.endDate) return null;
    return {
      start: task.startDate,
      end: task.endDate,
    };
  },

  /**
   * Get the earliest start date from tasks
   * @param tasks - Tasks to search
   * @returns Earliest date or null
   */
  getEarliestStartDate: (tasks: Task[]): Date | null => {
    const flat = ganttUtils.flattenTasks(tasks);
    const tasksWithDates = flat.filter(t => t.startDate);

    if (tasksWithDates.length === 0) return null;

    return new Date(Math.min(...tasksWithDates.map(t => t.startDate!.getTime())));
  },

  /**
   * Get the latest end date from tasks
   * @param tasks - Tasks to search
   * @returns Latest date or null
   */
  getLatestEndDate: (tasks: Task[]): Date | null => {
    const flat = ganttUtils.flattenTasks(tasks);
    const tasksWithDates = flat.filter(t => t.endDate);

    if (tasksWithDates.length === 0) return null;

    return new Date(Math.max(...tasksWithDates.map(t => t.endDate!.getTime())));
  },

  /**
   * Check if two tasks overlap in time
   * @param task1 - First task
   * @param task2 - Second task
   * @returns True if tasks overlap
   */
  tasksOverlap: (task1: Task, task2: Task): boolean => {
    if (!task1.startDate || !task1.endDate || !task2.startDate || !task2.endDate) {
      return false;
    }

    return task1.startDate <= task2.endDate && task2.startDate <= task1.endDate;
  },

  /**
   * Get all tasks that depend on a given task (children in dependency tree)
   * @param tasks - All tasks
   * @param taskId - Task ID to find dependents for
   * @returns Array of tasks that depend on this task
   */
  getDependentTasks: (tasks: Task[], taskId: string): Task[] => {
    const flat = ganttUtils.flattenTasks(tasks);
    return flat.filter(task =>
      task.dependencies && task.dependencies.includes(taskId)
    );
  },

  /**
   * Get all tasks that a given task depends on (parents in dependency tree)
   * @param tasks - All tasks
   * @param taskId - Task ID to find dependencies for
   * @returns Array of tasks this task depends on
   */
  getDependencyTasks: (tasks: Task[], taskId: string): Task[] => {
    const task = ganttUtils.findTaskById(tasks, taskId);
    if (!task || !task.dependencies) return [];

    const flat = ganttUtils.flattenTasks(tasks);
    return flat.filter(t => task.dependencies!.includes(t.id));
  },

  /**
   * Filter tasks by status
   * @param tasks - Tasks to filter
   * @param status - Status to filter by
   * @returns Filtered tasks
   */
  filterByStatus: (tasks: Task[], status: 'todo' | 'in-progress' | 'completed'): Task[] => {
    return ganttUtils.flattenTasks(tasks).filter(t => t.status === status);
  },

  /**
   * Filter tasks by date range
   * @param tasks - Tasks to filter
   * @param startDate - Range start
   * @param endDate - Range end
   * @returns Tasks that fall within the date range
   */
  filterByDateRange: (tasks: Task[], startDate: Date, endDate: Date): Task[] => {
    return ganttUtils.flattenTasks(tasks).filter(task => {
      if (!task.startDate || !task.endDate) return false;
      return task.startDate <= endDate && task.endDate >= startDate;
    });
  },

  /**
   * Sort tasks by start date
   * @param tasks - Tasks to sort
   * @param ascending - Sort ascending (default) or descending
   * @returns Sorted tasks
   */
  sortByStartDate: (tasks: Task[], ascending = true): Task[] => {
    return [...tasks].sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      const diff = a.startDate.getTime() - b.startDate.getTime();
      return ascending ? diff : -diff;
    });
  },

  /**
   * Sort tasks by end date
   * @param tasks - Tasks to sort
   * @param ascending - Sort ascending (default) or descending
   * @returns Sorted tasks
   */
  sortByEndDate: (tasks: Task[], ascending = true): Task[] => {
    return [...tasks].sort((a, b) => {
      if (!a.endDate || !b.endDate) return 0;
      const diff = a.endDate.getTime() - b.endDate.getTime();
      return ascending ? diff : -diff;
    });
  },

  /**
   * Sort tasks by progress
   * @param tasks - Tasks to sort
   * @param ascending - Sort ascending (default) or descending
   * @returns Sorted tasks
   */
  sortByProgress: (tasks: Task[], ascending = true): Task[] => {
    return [...tasks].sort((a, b) => {
      const diff = a.progress - b.progress;
      return ascending ? diff : -diff;
    });
  },

  /**
   * Calculate total progress across all tasks
   * @param tasks - Tasks to calculate
   * @returns Average progress percentage
   */
  calculateTotalProgress: (tasks: Task[]): number => {
    const flat = ganttUtils.flattenTasks(tasks);
    if (flat.length === 0) return 0;

    const total = flat.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(total / flat.length);
  },

  /**
   * Get task by path (array of indices in nested structure)
   * @param tasks - Root tasks
   * @param path - Array of indices [0, 2, 1] means tasks[0].subtasks[2].subtasks[1]
   * @returns Task at path or undefined
   */
  getTaskByPath: (tasks: Task[], path: number[]): Task | undefined => {
    let current: Task[] = tasks;
    let task: Task | undefined;

    for (let i = 0; i < path.length; i++) {
      const index = path[i];
      if (!current || index === undefined || index >= current.length) return undefined;

      task = current[index];
      if (!task) return undefined;

      if (i < path.length - 1) {
        current = task.subtasks || [];
      }
    }

    return task;
  },

  /**
   * Clone a task deeply (including subtasks)
   * @param task - Task to clone
   * @param newId - Optional new ID for the clone
   * @returns Cloned task
   */
  cloneTask: (task: Task, newId?: string): Task => {
    return {
      ...task,
      id: newId || `${task.id}-copy`,
      subtasks: task.subtasks?.map(st => ganttUtils.cloneTask(st)),
    };
  },

  /**
   * Export tasks to PDF format
   * @param tasks - Tasks to export
   * @param filename - Optional filename (default: 'gantt-chart.pdf')
   * @returns Promise<void>
   */
  exportToPDF: async (tasks: Task[], filename = 'gantt-chart.pdf'): Promise<void> => {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF() as any;
    const flat = ganttUtils.flattenTasks(tasks);

    // Title
    doc.setFontSize(16);
    doc.text('Gantt Chart - Task List', 14, 20);

    // Table data
    const headers = [['Task Name', 'Start Date', 'End Date', 'Duration', 'Progress', 'Status']];
    const data = flat.map(task => {
      const duration = task.startDate && task.endDate
        ? ganttUtils.calculateDuration(task.startDate, task.endDate)
        : 0;

      return [
        task.name,
        task.startDate ? ganttUtils.formatDate(task.startDate) : 'N/A',
        task.endDate ? ganttUtils.formatDate(task.endDate) : 'N/A',
        duration > 0 ? `${duration} days` : 'N/A',
        `${task.progress}%`,
        task.status || 'N/A',
      ];
    });

    // Generate table
    doc.autoTable({
      head: headers,
      body: data,
      startY: 30,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 60 }, // Task Name
        1: { cellWidth: 30 }, // Start Date
        2: { cellWidth: 30 }, // End Date
        3: { cellWidth: 25 }, // Duration
        4: { cellWidth: 20 }, // Progress
        5: { cellWidth: 25 }, // Status
      },
    });

    // Save the PDF
    doc.save(filename);
  },

  /**
   * Export tasks to Excel format
   * @param tasks - Tasks to export
   * @param filename - Optional filename (default: 'gantt-chart.xlsx')
   * @returns Promise<void>
   */
  exportToExcel: async (tasks: Task[], filename = 'gantt-chart.xlsx'): Promise<void> => {
    const XLSX = await import('xlsx');
    const flat = ganttUtils.flattenTasks(tasks);

    // Prepare data
    const data = flat.map(task => {
      const duration = task.startDate && task.endDate
        ? ganttUtils.calculateDuration(task.startDate, task.endDate)
        : 0;

      return {
        'Task ID': task.id,
        'Task Name': task.name,
        'Start Date': task.startDate ? ganttUtils.formatDate(task.startDate) : '',
        'End Date': task.endDate ? ganttUtils.formatDate(task.endDate) : '',
        'Duration (days)': duration > 0 ? duration : '',
        'Progress (%)': task.progress,
        'Status': task.status || '',
        'Assignees': task.assignees?.map(a => a.name).join(', ') || '',
        'Dependencies': task.dependencies?.join(', ') || '',
        'Is Milestone': task.isMilestone ? 'Yes' : 'No',
        'Parent ID': task.parentId || '',
        'Level': task.level || 0,
      };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Task ID
      { wch: 40 }, // Task Name
      { wch: 12 }, // Start Date
      { wch: 12 }, // End Date
      { wch: 15 }, // Duration
      { wch: 12 }, // Progress
      { wch: 15 }, // Status
      { wch: 30 }, // Assignees
      { wch: 20 }, // Dependencies
      { wch: 12 }, // Is Milestone
      { wch: 15 }, // Parent ID
      { wch: 8 },  // Level
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gantt Tasks');

    // Save the file
    XLSX.writeFile(workbook, filename);
  },
};
