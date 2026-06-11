type DevUser = {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  score: number;
  gamesPlayed: number;
  correctAnswers: number;
  totalAnswers: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
};

type DevSession = {
  id: string;
  userId: string;
  mode: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  timeTaken: number;
  topic?: string;
  createdAt: Date;
};

type DevEntry = {
  id: string;
  userId: string;
  rank: number;
  weeklyScore: number;
  updatedAt: Date;
};

const users = new Map<string, DevUser>();
const sessions: DevSession[] = [];
const entries = new Map<string, DevEntry>();

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const devStore = {
  findUserByUsername(username: string): DevUser | null {
    return users.get(username) ?? null;
  },
  findUserById(userId: string): DevUser | null {
    for (const user of users.values()) if (user.id === userId) return user;
    return null;
  },
  createUser(input: { name: string; username: string; passwordHash: string }): DevUser {
    const now = new Date();
    const user: DevUser = {
      id: id("usr"),
      name: input.name,
      username: input.username,
      passwordHash: input.passwordHash,
      score: 0,
      gamesPlayed: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      level: 1,
      createdAt: now,
      updatedAt: now
    };
    users.set(user.username, user);
    return user;
  },
  updateUser(userId: string, patch: Partial<DevUser>): DevUser | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    Object.assign(user, patch, { updatedAt: new Date() });
    return user;
  },
  addSession(input: Omit<DevSession, "id" | "createdAt">): DevSession {
    const session: DevSession = { ...input, id: id("ses"), createdAt: new Date() };
    sessions.push(session);
    return session;
  },
  getUserSessions(userId: string): DevSession[] {
    return sessions
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20);
  },
  bumpWeeklyScore(userId: string, score: number): DevEntry {
    let entry = entries.get(userId);
    if (!entry) {
      entry = { id: id("ldr"), userId, rank: 0, weeklyScore: 0, updatedAt: new Date() };
      entries.set(userId, entry);
    }
    entry.weeklyScore += score;
    entry.updatedAt = new Date();
    return entry;
  },
  leaderboardTop() {
    return [...users.values()].sort((a, b) => b.score - a.score).slice(0, 10);
  },
  weeklyTop() {
    return [...entries.values()].sort((a, b) => b.weeklyScore - a.weeklyScore).slice(0, 10);
  }
};
