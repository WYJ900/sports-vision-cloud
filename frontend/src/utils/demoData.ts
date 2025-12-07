import dayjs from 'dayjs'

// ============================================
// 类型定义
// ============================================

export interface TrendData {
  date: string
  avg_hit_rate: number
  avg_reaction_time: number
  sessions: number
  accuracy: number
  calories: number
}

export interface TrainingSession {
  id: string
  start_time: string
  duration_seconds: number
  metrics: {
    hit_rate: number
    reaction_time: number
    accuracy: number
    fatigue_level: number
    calories_burned: number
  }
  training_mode: string
}

export interface UserLevelConfig {
  name: string
  hitRate: { min: number; max: number; growth: number }
  reactionTime: { min: number; max: number; improve: number }
  accuracy: { min: number; max: number; growth: number }
  sessionsPerWeek: { min: number; max: number }
  fatigueLevel: { min: number; max: number }
  caloriesPerSession: { min: number; max: number }
  overallScore: number
  rankPercentile: number
}

export interface DashboardStats {
  total_users: number
  active_devices: number
  today_sessions: number
  avg_hit_rate: number
  avg_reaction_time: number
  total_training_hours: number
}

// ============================================
// 确定性种子随机数生成器
// ============================================

function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const x = Math.sin(hash) * 10000
  return x - Math.floor(x)
}

function seededRandomRange(seed: string, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min)
}

// ============================================
// 用户等级配置
// ============================================

const USER_CONFIGS: Record<string, UserLevelConfig> = {
  demo1: {
    name: '业余入门',
    hitRate: { min: 45, max: 58, growth: 0.12 },
    reactionTime: { min: 480, max: 580, improve: -0.8 },
    accuracy: { min: 48, max: 62, growth: 0.10 },
    sessionsPerWeek: { min: 2, max: 4 },
    fatigueLevel: { min: 40, max: 70 },
    caloriesPerSession: { min: 180, max: 320 },
    overallScore: 58,
    rankPercentile: 65,
  },
  demo2: {
    name: '业余高手',
    hitRate: { min: 62, max: 76, growth: 0.15 },
    reactionTime: { min: 340, max: 420, improve: -1.0 },
    accuracy: { min: 65, max: 80, growth: 0.13 },
    sessionsPerWeek: { min: 4, max: 6 },
    fatigueLevel: { min: 28, max: 55 },
    caloriesPerSession: { min: 280, max: 420 },
    overallScore: 75,
    rankPercentile: 28,
  },
  demo3: {
    name: '职业高手',
    hitRate: { min: 78, max: 92, growth: 0.08 },
    reactionTime: { min: 260, max: 320, improve: -0.6 },
    accuracy: { min: 82, max: 94, growth: 0.06 },
    sessionsPerWeek: { min: 5, max: 7 },
    fatigueLevel: { min: 18, max: 42 },
    caloriesPerSession: { min: 340, max: 480 },
    overallScore: 91,
    rankPercentile: 5,
  },
}

// ============================================
// 公共函数
// ============================================

export const getUserLevelConfig = (username?: string): UserLevelConfig => {
  const level = username?.toLowerCase() || 'demo1'
  return USER_CONFIGS[level] || USER_CONFIGS.demo1
}

// 生成日期范围：10月01日 - 12月13日（74天）
export const generateDateRange = (): dayjs.Dayjs[] => {
  const dates: dayjs.Dayjs[] = []
  const startDate = dayjs('2024-10-01')
  const endDate = dayjs('2024-12-13')
  let currentDate = startDate

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
    dates.push(currentDate)
    currentDate = currentDate.add(1, 'day')
  }

  return dates
}
// 判断当天是否训练（确定性）
export const shouldTrainOnDay = (
  date: dayjs.Dayjs,
  sessionsPerWeek: { min: number; max: number },
  username: string = 'demo1'
): boolean => {
  const seed = 'train-' + username + '-' + date.format('YYYY-MM-DD')
  const dayOfWeek = date.day()

  // 周末训练概率更高
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return seededRandom(seed) < 0.75
  }

  // 根据训练频率决定平日训练概率
  const avgSessions = (sessionsPerWeek.min + sessionsPerWeek.max) / 2
  const trainProbability = avgSessions / 7
  return seededRandom(seed) < trainProbability
}

// 生成单次训练指标（确定性）
export const generateTrainingSession = (
  date: dayjs.Dayjs,
  dayIndex: number,
  totalDays: number,
  config: UserLevelConfig,
  sessionIndex: number = 0,
  username: string = 'demo1'
): TrainingSession['metrics'] => {
  const baseSeed = 'metrics-' + username + '-' + date.format('YYYY-MM-DD') + '-' + sessionIndex
  const progress = dayIndex / totalDays

  const hitRateVariation = seededRandomRange(baseSeed + '-hit', -3, 3)
  const hitRate = config.hitRate.min +
    (config.hitRate.max - config.hitRate.min) * progress +
    hitRateVariation

  const reactionVariation = seededRandomRange(baseSeed + '-react', -15, 15)
  const reactionTime = config.reactionTime.max +
    (config.reactionTime.min - config.reactionTime.max) * progress +
    reactionVariation

  const accuracyVariation = seededRandomRange(baseSeed + '-acc', -3, 3)
  const accuracy = config.accuracy.min +
    (config.accuracy.max - config.accuracy.min) * progress +
    accuracyVariation

  const fatigueLevel = seededRandomRange(baseSeed + '-fatigue', config.fatigueLevel.min, config.fatigueLevel.max)
  const caloriesBurned = seededRandomRange(baseSeed + '-cal', config.caloriesPerSession.min, config.caloriesPerSession.max)

  return {
    hit_rate: Math.max(0, Math.min(100, hitRate)),
    reaction_time: Math.max(200, reactionTime),
    accuracy: Math.max(0, Math.min(100, accuracy)),
    fatigue_level: Math.max(0, Math.min(100, fatigueLevel)),
    calories_burned: Math.max(100, caloriesBurned),
  }
}

// ============================================
// 核心数据生成函数（统一数据源）
// ============================================

export const generateTrendData = (username?: string): TrendData[] => {
  const trends: TrendData[] = []
  const config = getUserLevelConfig(username)
  const dates = generateDateRange()
  const totalDays = dates.length
  const user = username?.toLowerCase() || 'demo1'

  dates.forEach((date, index) => {
    const seed = 'sessions-' + user + '-' + date.format('YYYY-MM-DD')

    let sessionsCount = 0
    if (shouldTrainOnDay(date, config.sessionsPerWeek, user)) {
      sessionsCount = seededRandom(seed + '-count') < 0.6 ? 1 : 2
    }

    if (sessionsCount > 0) {
      let totalHitRate = 0
      let totalReactionTime = 0
      let totalAccuracy = 0
      let totalCalories = 0

      for (let i = 0; i < sessionsCount; i++) {
        const metrics = generateTrainingSession(date, index, totalDays, config, i, user)
        totalHitRate += metrics.hit_rate
        totalReactionTime += metrics.reaction_time
        totalAccuracy += metrics.accuracy
        totalCalories += metrics.calories_burned
      }

      trends.push({
        date: date.format('MM-DD'),
        avg_hit_rate: totalHitRate / sessionsCount,
        avg_reaction_time: totalReactionTime / sessionsCount,
        sessions: sessionsCount,
        accuracy: totalAccuracy / sessionsCount,
        calories: totalCalories,
      })
    } else {
      trends.push({
        date: date.format('MM-DD'),
        avg_hit_rate: 0,
        avg_reaction_time: 0,
        sessions: 0,
        accuracy: 0,
        calories: 0,
      })
    }
  })

  return trends
}

export const generateSessionList = (username?: string): TrainingSession[] => {
  const sessions: TrainingSession[] = []
  const config = getUserLevelConfig(username)
  const dates = generateDateRange()
  const totalDays = dates.length
  const user = username?.toLowerCase() || 'demo1'

  dates.forEach((date, index) => {
    const seed = 'sessions-' + user + '-' + date.format('YYYY-MM-DD')

    if (shouldTrainOnDay(date, config.sessionsPerWeek, user)) {
      const sessionsCount = seededRandom(seed + '-count') < 0.6 ? 1 : 2

      for (let i = 0; i < sessionsCount; i++) {
        const hour = 14 + Math.floor(seededRandom(seed + '-hour-' + i) * 6)
        const metrics = generateTrainingSession(date, index, totalDays, config, i, user)
        const modes = ['standard', 'intensive', 'recovery']
        const modeIndex = Math.floor(seededRandom(seed + '-mode-' + i) * 3)

        sessions.push({
          id: 'session-' + date.format('YYYYMMDD') + '-' + hour + '-' + i,
          start_time: date.hour(hour).minute(0).second(0).format(),
          duration_seconds: 1200 + Math.floor(seededRandom(seed + '-dur-' + i) * 2400),
          metrics,
          training_mode: modes[modeIndex],
        })
      }
    }
  })

  return sessions.reverse()
}

export const calculateStats = (username?: string): DashboardStats => {
  const trends = generateTrendData(username)
  const user = username?.toLowerCase() || 'demo1'

  const trainedDays = trends.filter(t => t.sessions > 0)
  const totalSessions = trainedDays.reduce((sum, t) => sum + t.sessions, 0)

  const avgHitRate = trainedDays.length > 0
    ? trainedDays.reduce((sum, t) => sum + t.avg_hit_rate, 0) / trainedDays.length
    : 0
  const avgReactionTime = trainedDays.length > 0
    ? trainedDays.reduce((sum, t) => sum + t.avg_reaction_time, 0) / trainedDays.length
    : 0

  const todaySeed = 'today-' + user + '-stats'
  const todaySessions = Math.floor(seededRandom(todaySeed) * 3) + 1

  const avgSessionMinutes = 35
  const totalTrainingHours = (totalSessions * avgSessionMinutes) / 60

  return {
    total_users: 1250,
    active_devices: 2,
    today_sessions: todaySessions,
    avg_hit_rate: avgHitRate,
    avg_reaction_time: avgReactionTime,
    total_training_hours: totalTrainingHours,
  }
}

export const getRecentTrends = (username?: string, days: number = 7): TrendData[] => {
  const allTrends = generateTrendData(username)
  return allTrends.slice(-days)
}
