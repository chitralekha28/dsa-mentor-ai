const STORAGE_KEY = "dsaMentorProgress";

const readProgress = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const writeProgress = (progress) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event("progress-updated"));
};

export const getProgress = () => readProgress();

export const getProblemProgress = (problemId) => readProgress()[problemId] || {};

export const markAttempted = (problem, language) => {
  const progress = readProgress();
  const current = progress[problem.id] || {};

  progress[problem.id] = {
    ...current,
    company: problem.company,
    difficulty: problem.difficulty,
    id: problem.id,
    lastAttemptedAt: new Date().toISOString(),
    language,
    status: current.status === "solved" ? "solved" : "attempted",
    title: problem.title,
  };

  writeProgress(progress);
};

export const markSolved = (problem, language, runtime) => {
  const progress = readProgress();
  const current = progress[problem.id] || {};

  progress[problem.id] = {
    ...current,
    company: problem.company,
    difficulty: problem.difficulty,
    id: problem.id,
    language,
    lastAttemptedAt: new Date().toISOString(),
    runtime,
    solvedAt: new Date().toISOString(),
    status: "solved",
    title: problem.title,
  };

  writeProgress(progress);
};

export const getProgressSummary = () => {
  const entries = Object.values(readProgress());
  const solved = entries.filter((item) => item.status === "solved");
  const attempted = entries.filter((item) => item.status === "attempted");

  return {
    attempted: attempted.length,
    entries,
    solved: solved.length,
    totalTouched: entries.length,
  };
};
