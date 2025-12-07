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
    hitRate: { min: 35, max: 52, growth: 0.15 },
    reactionTime: { min: 520, max: 650, improve: -0.5 },
    accuracy: { min: 40, max: 55, growth: 0.12 },
    sessionsPerWeek: { min: 1, max: 3 },  // 业余：每周1-3次
    fatigueLevel: { min: 45, max: 75 },
    caloriesPerSession: { min: 150, max: 280 },
    overallScore: 48,
    rankPercentile: 75,
  },
  demo2: {
    name: '业余高手',
    hitRate: { min: 58, max: 72, growth: 0.12 },
    reactionTime: { min: 380, max: 480, improve: -0.8 },
    accuracy: { min: 60, max: 75, growth: 0.10 },
    sessionsPerWeek: { min: 3, max: 5 },  // 中等：每周3-5次
    fatigueLevel: { min: 30, max: 58 },
    caloriesPerSession: { min: 250, max: 380 },
    overallScore: 68,
    rankPercentile: 35,
  },
  demo3: {
    name: '职业选手',
    hitRate: { min: 82, max: 95, growth: 0.05 },
    reactionTime: { min: 220, max: 300, improve: -0.3 },
    accuracy: { min: 85, max: 96, growth: 0.04 },
    sessionsPerWeek: { min: 5, max: 7 },  // 职业：每周5-7次
    fatigueLevel: { min: 15, max: 38 },
    caloriesPerSession: { min: 380, max: 520 },
    overallScore: 92,
    rankPercentile: 3,
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
// 判断当天是否训练（确定性）- 根据用户水平差异化
export const shouldTrainOnDay = (
  date: dayjs.Dayjs,
  _sessionsPerWeek: { min: number; max: number },
  username: string = 'demo1'
): boolean => {
  const seed = 'train-' + username + '-' + date.format('YYYY-MM-DD')
  const dayOfWeek = date.day()
  const user = username.toLowerCase()

  // 根据用户水平设置基础训练概率
  let baseProbability: number
  if (user === 'demo3') {
    baseProbability = 0.85  // 职业选手：85%的日子都训练
  } else if (user === 'demo2') {
    baseProbability = 0.55  // 业余高手：55%的日子训练
  } else {
    baseProbability = 0.30  // 业余入门：30%的日子训练
  }

  // 周末训练概率调整
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    baseProbability = Math.min(baseProbability + 0.15, 0.95)
  }

  return seededRandom(seed) < baseProbability
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

    // 判断是否训练
    if (!shouldTrainOnDay(date, config.sessionsPerWeek, user)) {
      return // 跳过没有训练的日期，不添加0值
    }

    // 职业选手一天可能练2-3次，业余1-2次
    let sessionsCount: number
    const countRand = seededRandom(seed + '-count')
    if (user === 'demo3') {
      sessionsCount = countRand < 0.3 ? 1 : countRand < 0.7 ? 2 : 3
    } else if (user === 'demo2') {
      sessionsCount = countRand < 0.5 ? 1 : 2
    } else {
      sessionsCount = countRand < 0.8 ? 1 : 2
    }

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
  // 只返回有训练数据的日期（过滤掉 sessions=0 的记录）
  const validTrends = allTrends.filter(t => t.sessions > 0)
  // 返回最近N天的有效数据
  return validTrends.slice(-days)
}
