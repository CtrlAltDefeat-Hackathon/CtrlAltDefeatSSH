import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Quiz System Tables
export const subjects = sqliteTable('subjects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subjectId: integer('subject_id').references(() => subjects.id),
  questionText: text('question_text').notNull(),
  explanation: text('explanation'),
  difficultyLevel: text('difficulty_level'),
  xpReward: integer('xp_reward').default(10),
  coinReward: integer('coin_reward').default(2),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const questionOptions = sqliteTable('question_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionId: integer('question_id').references(() => questions.id),
  optionText: text('option_text').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).default(false),
  optionOrder: integer('option_order'),
});

export const questionTranslations = sqliteTable('question_translations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionId: integer('question_id').references(() => questions.id),
  languageCode: text('language_code'),
  questionText: text('question_text').notNull(),
  explanation: text('explanation'),
});

export const optionTranslations = sqliteTable('option_translations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  optionId: integer('option_id').references(() => questionOptions.id),
  languageCode: text('language_code'),
  optionText: text('option_text').notNull(),
});

export const userProgress = sqliteTable('user_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id),
  xp: integer('xp').default(0),
  coins: integer('coins').default(0),
  level: integer('level').default(1),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastActivityDate: text('last_activity_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const quizAttempts = sqliteTable('quiz_attempts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id),
  subjectId: integer('subject_id').references(() => subjects.id),
  questionsAnswered: integer('questions_answered'),
  correctAnswers: integer('correct_answers'),
  scorePercentage: integer('score_percentage'),
  xpEarned: integer('xp_earned'),
  coinsEarned: integer('coins_earned'),
  timeTakenSeconds: integer('time_taken_seconds'),
  completedAt: text('completed_at'),
  createdAt: text('created_at'),
});

export const quizQuestionAttempts = sqliteTable('quiz_question_attempts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  quizAttemptId: integer('quiz_attempt_id').references(() => quizAttempts.id),
  questionId: integer('question_id').references(() => questions.id),
  selectedOptionId: integer('selected_option_id').references(() => questionOptions.id),
  isCorrect: integer('is_correct', { mode: 'boolean' }),
  timeTakenSeconds: integer('time_taken_seconds'),
});

export const badges = sqliteTable('badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  requirementType: text('requirement_type'),
  requirementValue: integer('requirement_value'),
  createdAt: text('created_at'),
});

export const userBadges = sqliteTable('user_badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id),
  badgeId: integer('badge_id').references(() => badges.id),
  earnedAt: text('earned_at'),
});