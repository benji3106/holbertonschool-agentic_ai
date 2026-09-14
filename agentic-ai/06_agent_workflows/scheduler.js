const fs = require('node:fs/promises');
const path = require('node:path');

const tasksPath = process.env.TASKS_FILE || path.join(__dirname, 'tasks.json');
const intervalMs = 5000;

let stopping = false;
let resolveWait;

function stop() {
  stopping = true;
  if (resolveWait) {
    resolveWait();
    resolveWait = undefined;
  }
}

process.once('SIGINT', stop);
process.once('SIGTERM', stop);

function validateTasks(tasks) {
  if (!Array.isArray(tasks)) {
    throw new Error('le fichier doit contenir une liste de tâches');
  }

  for (const [index, task] of tasks.entries()) {
    if (
      task === null ||
      typeof task !== 'object' ||
      typeof task.id !== 'number' ||
      !Number.isFinite(task.id) ||
      typeof task.action !== 'string' ||
      typeof task.status !== 'string'
    ) {
      throw new Error(`la tâche à l'index ${index} est invalide`);
    }
  }

  return tasks;
}

async function readTasks() {
  let content;

  try {
    content = await fs.readFile(tasksPath, 'utf8');
  } catch (error) {
    throw new Error(`impossible de lire ${tasksPath}: ${error.message}`);
  }

  let tasks;
  try {
    tasks = JSON.parse(content);
  } catch (error) {
    throw new Error(`JSON invalide dans ${tasksPath}: ${error.message}`);
  }

  return validateTasks(tasks);
}

function waitForNextCycle() {
  return new Promise((resolve) => {
    resolveWait = () => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(() => {
      resolveWait = undefined;
      resolve();
    }, intervalMs);
    if (stopping) {
      resolveWait();
      resolveWait = undefined;
    }
  });
}

async function run() {
  let firstCycle = true;

  while (!stopping) {
    try {
      const tasks = await readTasks();
      const pendingTask = tasks.find((task) => task.status === 'pending');

      if (pendingTask) {
        console.log(pendingTask.action);
      } else {
        console.log('Aucune tâche pending disponible.');
      }
    } catch (error) {
      if (firstCycle) {
        throw error;
      }

      console.error(`Erreur de lecture des tâches: ${error.message}`);
    }

    firstCycle = false;
    await waitForNextCycle();
  }
}

run().catch((error) => {
  console.error(`Erreur: ${error.message}`);
  process.exitCode = 1;
});