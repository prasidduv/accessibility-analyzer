export type UserProfile = {
  id: string;
  name: string;
  username: string;
  score: number;
  gamesPlayed: number;
  correctAnswers: number;
  totalAnswers: number;
  level: number;
};

export type AuthResponse = {
  accessToken: string;
  user: { id: string; name: string; username: string };
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
};
