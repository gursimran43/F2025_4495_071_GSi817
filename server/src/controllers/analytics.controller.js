const Task = require('../models/Task');

// @desc    Get user analytics
// @route   GET /api/analytics
// @access  Private
exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all user tasks
    const allTasks = await Task.find({ userId }).sort({ createdAt: 1 });

    // Calculate overall stats
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate progress over last 6 months
    const progressData = calculateMonthlyProgress(allTasks);

    // Calculate weekly activity (last 7 days)
    const weeklyActivity = calculateWeeklyActivity(allTasks);

    // Calculate category distribution
    const categoryData = calculateCategoryDistribution(allTasks);

    // Calculate skills progress based on task categories
    const skillsData = calculateSkillsProgress(allTasks);

    // Streak calculation
    const currentStreak = calculateCurrentStreak(allTasks);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalTasks,
          completedTasks,
          pendingTasks: totalTasks - completedTasks,
          completionRate,
          currentStreak,
        },
        progressData,
        weeklyActivity,
        categoryData,
        skillsData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Calculate monthly progress for last 6 months
function calculateMonthlyProgress(tasks) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const data = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

    const monthTasks = tasks.filter(t => {
      const createdDate = new Date(t.createdAt);
      return createdDate >= monthStart && createdDate <= monthEnd;
    });

    const completedInMonth = monthTasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate >= monthStart && completedDate <= monthEnd;
    }).length;

    const avgProgress = monthTasks.length > 0
      ? Math.round(monthTasks.reduce((sum, t) => sum + t.percentage, 0) / monthTasks.length)
      : 0;

    // Estimate hours (2 hours per completed task on average)
    const hoursSpent = completedInMonth * 2;

    data.push({
      month: months[monthDate.getMonth()],
      progress: avgProgress,
      tasksCompleted: completedInMonth,
      hoursSpent: hoursSpent,
    });
  }

  return data;
}

// Helper: Calculate activity for last 7 days
function calculateWeeklyActivity(tasks) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Count tasks with activity on this day (created or completed)
    const tasksActive = tasks.filter(t => {
      const created = new Date(t.createdAt);
      const completed = t.completedAt ? new Date(t.completedAt) : null;

      const createdToday = created >= date && created <= dayEnd;
      const completedToday = completed && completed >= date && completed <= dayEnd;

      return createdToday || completedToday;
    }).length;

    // Count completed subtasks on this day
    const subtasksCompleted = tasks.reduce((count, task) => {
      if (!task.subtasks || task.subtasks.length === 0) return count;

      // Estimate: if task was updated today and has completed subtasks
      const updated = new Date(task.updatedAt);
      const updatedToday = updated >= date && updated <= dayEnd;

      if (updatedToday) {
        return count + task.subtasks.filter(st => st.completed).length;
      }
      return count;
    }, 0);

    // Estimate hours: 0.5 hours per task activity + 0.25 hours per subtask
    const hours = Math.round((tasksActive * 0.5 + subtasksCompleted * 0.25) * 10) / 10;

    data.push({
      day: days[date.getDay()],
      hours: hours,
      tasks: tasksActive,
    });
  }

  return data;
}

// Helper: Calculate category distribution
function calculateCategoryDistribution(tasks) {
  const categoryCounts = {};

  tasks.forEach(task => {
    const category = task.category || 'Other';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  // Convert to array and sort by value
  const data = Object.entries(categoryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return data;
}

// Helper: Calculate skills progress based on task categories
function calculateSkillsProgress(tasks) {
  const categoryMapping = {
    'Learning': 'Technical',
    'Projects': 'Technical',
    'Skills': 'Technical',
    'Practice': 'Technical',
    'Networking': 'Communication',
    'Foundation': 'Leadership',
    'Research': 'Analytics',
    'Certification': 'Leadership',
    'Portfolio': 'Strategy',
  };

  const skillProgress = {
    'Technical': { completed: 0, total: 0 },
    'Communication': { completed: 0, total: 0 },
    'Leadership': { completed: 0, total: 0 },
    'Analytics': { completed: 0, total: 0 },
    'Strategy': { completed: 0, total: 0 },
  };

  tasks.forEach(task => {
    const skill = categoryMapping[task.category] || 'Technical';
    skillProgress[skill].total++;
    if (task.completed) {
      skillProgress[skill].completed++;
    }
  });

  // Calculate percentages with target being 100%
  const data = Object.entries(skillProgress).map(([skill, stats]) => {
    const current = stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;

    return {
      skill,
      current,
      target: 100, // Target is always 100% completion
    };
  });

  return data;
}

// Helper: Calculate current streak
function calculateCurrentStreak(tasks) {
  const completedTasks = tasks
    .filter(t => t.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  if (completedTasks.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < completedTasks.length; i++) {
    const completedDate = new Date(completedTasks[i].completedAt);
    completedDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));

    // If completed today or yesterday, continue streak
    if (daysDiff === streak || daysDiff === streak + 1) {
      if (daysDiff === streak + 1) streak++;
    } else {
      break;
    }
  }

  return streak;
}
