import dayjs from 'dayjs'

// 根据用户名获取训练水平配置
export const getUserLevelConfig = (username?: string) => {
  const level = username?.toLowerCase() || 'demo1'

  const configs = {
    demo1: {
      name: '业余入门',
      hitRate: { min: 50, max: 65, growth: 0.15 },        // 击球率 50-65%
      reactionTime: { min: 450, max: 550, improve: -1 },  // 反应时间 450-550ms
      accuracy: { min: 55, max: 70, growth: 0.12 },       // 准确度 55-70%
      sessionsPerWeek: { min: 2, max: 4 },                // 每周训练 2-4 次
      fatigueLevel: { min: 35, max: 65 },                 // 疲劳度较高
      caloriesPerSession: { min: 200, max: 350 },         // 卡路里消耗
      overallScore: 65,                                    // 综合评分
      rankPercentile: 60,                                  // 排名：前 60%
    },
    demo2: {
      name: '业余高手',
      hitRate: { min: 65, max: 80, growth: 0.18 },
      reactionTime: { min: 350, max: 450, improve: -1.2 },
      accuracy: { min: 70, max: 85, growth: 0.15 },
      sessionsPerWeek: { min: 4, max: 6 },
      fatigueLevel: { min: 25, max: 55 },
      caloriesPerSession: { min: 300, max: 450 },
      overallScore: 78,
      rankPercentile: 30,                                  // 排名：前 30%
    },
    demo3: {
      name: '职业高手',
      hitRate: { min: 80, max: 95, growth: 0.10 },
      reactionTime: { min: 250, max: 350, improve: -0.8 },
      accuracy: { min: 85, max: 95, growth: 0.08 },
      sessionsPerWeek: { min: 5, max: 7 },
      fatigueLevel: { min: 15, max: 45 },
      caloriesPerSession: { min: 350, max: 500 },
      overallScore: 92,
      rankPercentile: 5,                                   // 排名：前 5%
    },
  }

  return configs[level as keyof typeof configs] || configs.demo1
}

// 生成从 10.1 到 12.12 的日期数组（73天）
export const generateDateRange = () => {
  const dates = []
  const startDate = dayjs('2024-10-01')
  const endDate = dayjs('2024-12-12')
  let currentDate = startDate

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
    dates.push(currentDate)
    currentDate = currentDate.add(1, 'day')
  }

  return dates
}

// 判断当天是否有训练（根据每周训练频率）
export const shouldTrainOnDay = (date: dayjs.Dayjs, sessionsPerWeek: { min: number, max: number }) => {
  const dayOfWeek = date.day()
  
  // 周末训练概率更高
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return Math.random() < 0.7
  }

  // 根据训练频率决定平日训练概率
  const avgSessions = (sessionsPerWeek.min + sessionsPerWeek.max) / 2
  const trainProbability = avgSessions / 7

  return Math.random() < trainProbability
}

// 生成单次训练数据
export const generateTrainingSession = (
  _date: dayjs.Dayjs,
  dayIndex: number,
  totalDays: number,
  config: ReturnType<typeof getUserLevelConfig>
) => {
  // 计算进步曲线（随时间提升）
  const progress = dayIndex / totalDays

  // 击球率：从最小值逐渐提升
  const hitRate = config.hitRate.min +
    (config.hitRate.max - config.hitRate.min) * progress +
    Math.random() * 5 - 2.5

  // 反应时间：从最大值逐渐降低（越小越好）
  const reactionTime = config.reactionTime.max +
    (config.reactionTime.min - config.reactionTime.max) * progress +
    Math.random() * 20 - 10

  // 准确度：逐渐提升
  const accuracy = config.accuracy.min +
    (config.accuracy.max - config.accuracy.min) * progress +
    Math.random() * 5 - 2.5

  // 疲劳度：随机波动
  const fatigueLevel = config.fatigueLevel.min +
    Math.random() * (config.fatigueLevel.max - config.fatigueLevel.min)

  // 卡路里消耗
  const caloriesBurned = config.caloriesPerSession.min +
    Math.random() * (config.caloriesPerSession.max - config.caloriesPerSession.min)

  return {
    hit_rate: Math.max(0, Math.min(100, hitRate)),
    reaction_time: Math.max(200, reactionTime),
    accuracy: Math.max(0, Math.min(100, accuracy)),
    fatigue_level: Math.max(0, Math.min(100, fatigueLevel)),
    calories_burned: Math.max(100, caloriesBurned),
  }
}
