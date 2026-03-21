export interface TodoistMetrics {
  activeProjects: number;
  totalTasks: number;
  weeklyRevenue: number;
  overdueTasks: number;
}

function getTodoistToken(): string {
  const token = process.env.NEXT_PUBLIC_TODOIST_TOKEN;
  if (!token) {
    throw new Error('Todoist token not configured in environment');
  }
  return token;
}

export async function fetchTodoistMetrics(): Promise<TodoistMetrics> {
  try {
    const apiToken = getTodoistToken();

    const projectResponse = await fetch('https://api.todoist.com/rest/v2/projects', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
      },
    });

    if (projectResponse.status === 401) throw new Error('Todoist: Unauthorized (token invalid or expired)');
    if (projectResponse.status === 429) throw new Error('Todoist: Rate limited. Please try again later.');
    if (!projectResponse.ok) throw new Error(`Todoist Projects: HTTP ${projectResponse.status}`);

    const projects = await projectResponse.json();
    const activeProjects = projects.filter((p: any) => !p.is_favorite).length;

    const taskResponse = await fetch('https://api.todoist.com/rest/v2/tasks', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
      },
    });

    if (!taskResponse.ok) throw new Error(`Todoist Tasks: HTTP ${taskResponse.status}`);

    const tasks = await taskResponse.json();
    const totalTasks = tasks.length;

    let weeklyRevenue = 0;
    tasks.forEach((task: any) => {
      const description = task.description || '';
      const matches = description.match(/\$(\d+,?\d*)/g);
      if (matches) {
        matches.forEach((match: string) => {
          const amount = parseInt(match.replace(/\$|,/g, ''), 10);
          if (!isNaN(amount)) {
            weeklyRevenue += amount;
          }
        });
      }
    });

    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter((task: any) =>
      task.due && task.due.date < today
    ).length;

    return { activeProjects, totalTasks, weeklyRevenue, overdueTasks };
  } catch (error) {
    console.error('Todoist API error:', error);
    throw error;
  }
}
