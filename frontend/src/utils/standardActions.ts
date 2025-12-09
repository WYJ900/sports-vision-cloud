// ============================================
// 工具函数
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
// 标准动作姿态数据（羽毛球标准动作）
// ============================================

// 生成标准动作姿态关键点
function generateStandardPose(actionType: string): number[][] {
  const keypoints: number[][] = []

  switch (actionType) {
    case '高远球': // 举拍动作
      keypoints.push([0.50, 0.15, 0, 0.95]) // 鼻子
      keypoints.push([0.48, 0.14, 0.01, 0.95]) // 左眼
      keypoints.push([0.52, 0.14, 0.01, 0.95]) // 右眼
      keypoints.push([0.46, 0.15, 0.02, 0.95]) // 左耳
      keypoints.push([0.54, 0.15, 0.02, 0.95]) // 右耳
      keypoints.push([0.42, 0.28, 0, 0.95]) // 左肩
      keypoints.push([0.58, 0.28, 0, 0.95]) // 右肩
      keypoints.push([0.35, 0.35, -0.15, 0.95]) // 左肘
      keypoints.push([0.65, 0.22, 0.10, 0.95]) // 右肘（举高）
      keypoints.push([0.28, 0.38, -0.25, 0.95]) // 左手腕
      keypoints.push([0.70, 0.12, 0.18, 0.95]) // 右手腕（最高点）
      keypoints.push([0.43, 0.55, 0, 0.95]) // 左髋
      keypoints.push([0.57, 0.55, 0, 0.95]) // 右髋
      keypoints.push([0.41, 0.75, 0.03, 0.95]) // 左膝
      keypoints.push([0.59, 0.73, -0.03, 0.95]) // 右膝
      keypoints.push([0.40, 0.95, 0.02, 0.95]) // 左踝
      keypoints.push([0.60, 0.93, -0.02, 0.95]) // 右踝
      break

    case '接杀球': // 防守低姿态
      keypoints.push([0.50, 0.35, 0, 0.95]) // 鼻子
      keypoints.push([0.48, 0.34, 0.01, 0.95])
      keypoints.push([0.52, 0.34, 0.01, 0.95])
      keypoints.push([0.46, 0.35, 0.02, 0.95])
      keypoints.push([0.54, 0.35, 0.02, 0.95])
      keypoints.push([0.40, 0.48, 0, 0.95]) // 左肩
      keypoints.push([0.60, 0.48, 0, 0.95]) // 右肩
      keypoints.push([0.32, 0.58, -0.12, 0.95]) // 左肘
      keypoints.push([0.68, 0.58, 0.12, 0.95]) // 右肘
      keypoints.push([0.25, 0.68, -0.20, 0.95]) // 左手腕
      keypoints.push([0.75, 0.68, 0.20, 0.95]) // 右手腕
      keypoints.push([0.42, 0.65, 0, 0.95]) // 左髋
      keypoints.push([0.58, 0.65, 0, 0.95]) // 右髋
      keypoints.push([0.38, 0.82, 0.05, 0.95]) // 左膝（弯曲）
      keypoints.push([0.62, 0.80, -0.05, 0.95]) // 右膝
      keypoints.push([0.36, 0.96, 0.03, 0.95]) // 左踝
      keypoints.push([0.64, 0.94, -0.03, 0.95]) // 右踝
      break

    case '平抽挡球': // 中位平抽
      keypoints.push([0.50, 0.20, 0, 0.95])
      keypoints.push([0.48, 0.19, 0.01, 0.95])
      keypoints.push([0.52, 0.19, 0.01, 0.95])
      keypoints.push([0.46, 0.20, 0.02, 0.95])
      keypoints.push([0.54, 0.20, 0.02, 0.95])
      keypoints.push([0.42, 0.33, 0, 0.95])
      keypoints.push([0.58, 0.33, 0, 0.95])
      keypoints.push([0.36, 0.42, -0.10, 0.95])
      keypoints.push([0.64, 0.35, 0.15, 0.95]) // 右肘前伸
      keypoints.push([0.30, 0.45, -0.15, 0.95])
      keypoints.push([0.72, 0.35, 0.25, 0.95]) // 右手腕前伸
      keypoints.push([0.43, 0.58, 0, 0.95])
      keypoints.push([0.57, 0.58, 0, 0.95])
      keypoints.push([0.41, 0.78, 0.03, 0.95])
      keypoints.push([0.59, 0.76, -0.03, 0.95])
      keypoints.push([0.40, 0.96, 0.02, 0.95])
      keypoints.push([0.60, 0.94, -0.02, 0.95])
      break

    default: // 默认准备姿势
      keypoints.push([0.50, 0.18, 0, 0.95])
      keypoints.push([0.48, 0.17, 0.01, 0.95])
      keypoints.push([0.52, 0.17, 0.01, 0.95])
      keypoints.push([0.46, 0.18, 0.02, 0.95])
      keypoints.push([0.54, 0.18, 0.02, 0.95])
      keypoints.push([0.42, 0.30, 0, 0.95])
      keypoints.push([0.58, 0.30, 0, 0.95])
      keypoints.push([0.35, 0.42, -0.08, 0.95])
      keypoints.push([0.65, 0.42, 0.08, 0.95])
      keypoints.push([0.28, 0.50, -0.12, 0.95])
      keypoints.push([0.72, 0.50, 0.12, 0.95])
      keypoints.push([0.43, 0.57, 0, 0.95])
      keypoints.push([0.57, 0.57, 0, 0.95])
      keypoints.push([0.41, 0.76, 0.03, 0.95])
      keypoints.push([0.59, 0.74, -0.03, 0.95])
      keypoints.push([0.40, 0.95, 0.02, 0.95])
      keypoints.push([0.60, 0.93, -0.02, 0.95])
  }

  // 镜像翻转x坐标，使标准动作与训练动作同向
  return keypoints.map(([x, y, z, conf]) => [1 - x, y, z, conf])
}

export interface ActionMatchData {
  sequence: number
  actionName: string
  similarity: number
  distance: number
  score: number
  standardPose: number[][]
}

// 羽毛球标准动作匹配数据（扩展到20条）
export const BADMINTON_ACTIONS: ActionMatchData[] = [
  { sequence: 1, actionName: '高远球', distance: 0.198, similarity: 0.802, score: 83.47, standardPose: generateStandardPose('高远球') },
  { sequence: 2, actionName: '挑球', distance: 0.252, similarity: 0.748, score: 79.87, standardPose: generateStandardPose('挑球') },
  { sequence: 3, actionName: '接杀球', distance: 0.076, similarity: 0.924, score: 92.94, standardPose: generateStandardPose('接杀球') },
  { sequence: 4, actionName: '平高球', distance: 0.138, similarity: 0.862, score: 87.87, standardPose: generateStandardPose('平高球') },
  { sequence: 5, actionName: '放网前球', distance: 0.154, similarity: 0.846, score: 86.66, standardPose: generateStandardPose('放网前球') },
  { sequence: 6, actionName: '平抽挡球', distance: 0.096, similarity: 0.904, score: 91.24, standardPose: generateStandardPose('平抽挡球') },
  { sequence: 7, actionName: '正手扑球', distance: 0.132, similarity: 0.868, score: 88.34, standardPose: generateStandardPose('正手扑球') },
  { sequence: 8, actionName: '正手勾球', distance: 0.141, similarity: 0.859, score: 87.64, standardPose: generateStandardPose('正手勾球') },
  { sequence: 9, actionName: '正手准球', distance: 0.126, similarity: 0.874, score: 88.81, standardPose: generateStandardPose('正手准球') },
  { sequence: 10, actionName: '正手吊球', distance: 0.164, similarity: 0.836, score: 85.91, standardPose: generateStandardPose('正手吊球') },
  { sequence: 11, actionName: '反手高远球', distance: 0.185, similarity: 0.815, score: 84.23, standardPose: generateStandardPose('高远球') },
  { sequence: 12, actionName: '正手杀球', distance: 0.112, similarity: 0.888, score: 89.76, standardPose: generateStandardPose('高远球') },
  { sequence: 13, actionName: '后场劈吊', distance: 0.168, similarity: 0.832, score: 85.42, standardPose: generateStandardPose('正手吊球') },
  { sequence: 14, actionName: '网前推球', distance: 0.143, similarity: 0.857, score: 87.28, standardPose: generateStandardPose('平抽挡球') },
  { sequence: 15, actionName: '反手接杀', distance: 0.089, similarity: 0.911, score: 90.65, standardPose: generateStandardPose('接杀球') },
  { sequence: 16, actionName: '跳杀', distance: 0.205, similarity: 0.795, score: 82.18, standardPose: generateStandardPose('高远球') },
  { sequence: 17, actionName: '搓球', distance: 0.121, similarity: 0.879, score: 88.95, standardPose: generateStandardPose('放网前球') },
  { sequence: 18, actionName: '勾对角', distance: 0.156, similarity: 0.844, score: 86.35, standardPose: generateStandardPose('正手勾球') },
  { sequence: 19, actionName: '反手挑球', distance: 0.178, similarity: 0.822, score: 84.76, standardPose: generateStandardPose('挑球') },
  { sequence: 20, actionName: '网前扑球', distance: 0.108, similarity: 0.892, score: 89.42, standardPose: generateStandardPose('正手扑球') },
]

// 根据用户水平生成动态匹配数据
export const generateActionMatches = (username?: string): ActionMatchData[] => {
  const user = username?.toLowerCase() || 'demo1'

  return BADMINTON_ACTIONS.map((action) => {
    const seed = 'action-' + user + '-' + action.actionName

    // 根据用户水平调整分值范围
    let scoreAdjustment: number
    if (user === 'demo3') {
      // 职业选手：85-95分
      scoreAdjustment = seededRandomRange(seed, -3, 5)
    } else if (user === 'demo2') {
      // 业余高手：75-88分
      scoreAdjustment = seededRandomRange(seed, -8, 3)
    } else {
      // 业余入门：65-80分
      scoreAdjustment = seededRandomRange(seed, -15, -2)
    }

    const adjustedScore = Math.max(60, Math.min(98, action.score + scoreAdjustment))
    const adjustedDistance = (100 - adjustedScore) / 500 // 反向计算距离
    const adjustedSimilarity = 1 - adjustedDistance

    return {
      ...action,
      distance: adjustedDistance,
      similarity: adjustedSimilarity,
      score: adjustedScore,
    }
  })
}

// 固定的标准高远球举拍姿态（用于双画面对比的右侧显示）
export const FIXED_STANDARD_POSE: number[][] = [
  [0.50, 0.15, 0, 0.95],      // 0: 鼻子
  [0.48, 0.14, 0.01, 0.95],   // 1: 左眼
  [0.52, 0.14, 0.01, 0.95],   // 2: 右眼
  [0.46, 0.15, 0.02, 0.95],   // 3: 左耳
  [0.54, 0.15, 0.02, 0.95],   // 4: 右耳
  [0.42, 0.28, 0, 0.95],      // 5: 左肩
  [0.58, 0.28, 0, 0.95],      // 6: 右肩
  [0.35, 0.35, -0.15, 0.95],  // 7: 左肘
  [0.65, 0.20, 0.15, 0.95],   // 8: 右肘（高举）
  [0.28, 0.38, -0.25, 0.95],  // 9: 左手腕
  [0.70, 0.10, 0.25, 0.95],   // 10: 右手腕（最高点）
  [0.43, 0.55, 0, 0.95],      // 11: 左髋
  [0.57, 0.55, 0, 0.95],      // 12: 右髋
  [0.41, 0.75, 0.03, 0.95],   // 13: 左膝
  [0.59, 0.73, -0.03, 0.95],  // 14: 右膝
  [0.40, 0.95, 0.02, 0.95],   // 15: 左踝
  [0.60, 0.93, -0.02, 0.95],  // 16: 右踝
]

// 获取当前匹配的标准动作
export const getCurrentStandardPose = (actionIndex: number): number[][] => {
  const action = BADMINTON_ACTIONS[actionIndex % BADMINTON_ACTIONS.length]
  return action.standardPose
}

// 获取固定的标准姿态（用于双画面对比）
export const getFixedStandardPose = (): number[][] => {
  return FIXED_STANDARD_POSE
}

// 将训练动作转换为标准动作（优化版本）
// 标准动作特点：手臂抬得更高、动作幅度更大、姿态更标准
export const convertToStandardPose = (trainingPose: number[][] | null): number[][] | null => {
  if (!trainingPose || trainingPose.length < 17) return trainingPose

  const standardPose = trainingPose.map(([x, y, z, conf]) => [x, y, z, conf])

  // 优化关键关节的位置，使其更标准
  // 右肘（8）和右手腕（10）- 如果是举拍动作，抬得更高
  if (standardPose[10] && standardPose[10][1] < 0.4) {
    // 右手腕在较高位置时，让标准动作更高
    standardPose[8][1] = standardPose[8][1] * 0.85 // 肘部抬高15%
    standardPose[10][1] = standardPose[10][1] * 0.75 // 手腕抬高25%
    standardPose[10][2] = standardPose[10][2] * 1.2 // z轴延伸更大
  }

  // 左肘（7）和左手腕（9）- 平衡手臂
  if (standardPose[9] && standardPose[9][1] < 0.5) {
    standardPose[7][1] = standardPose[7][1] * 0.92
    standardPose[9][1] = standardPose[9][1] * 0.90
  }

  // 膝盖弯曲度优化 - 让标准动作蹲得更标准
  if (standardPose[13] && standardPose[13][1] > 0.7) {
    standardPose[13][1] = standardPose[13][1] * 0.97 // 左膝稍微降低
    standardPose[14][1] = standardPose[14][1] * 0.97 // 右膝稍微降低
  }

  // 躯干挺直度优化
  const noseY = standardPose[0][1]
  const shoulderAvgY = (standardPose[5][1] + standardPose[6][1]) / 2
  const torsoLength = shoulderAvgY - noseY

  // 如果躯干前倾，标准动作更挺直
  if (torsoLength < 0.15) {
    const adjustment = 0.02
    standardPose[0][1] = standardPose[0][1] - adjustment // 头部稍微上抬
    standardPose[1][1] = standardPose[1][1] - adjustment
    standardPose[2][1] = standardPose[2][1] - adjustment
    standardPose[3][1] = standardPose[3][1] - adjustment
    standardPose[4][1] = standardPose[4][1] - adjustment
  }

  return standardPose
}

// 检测动作是否到达高点（用于触发数据更新）
export const isAtPeakPose = (currentPose: number[][] | null, prevPose: number[][] | null): boolean => {
  if (!currentPose || !prevPose || currentPose.length < 17 || prevPose.length < 17) return false

  // 检测右手腕（10）的y坐标是否到达最高点
  const currentWristY = currentPose[10][1]
  const prevWristY = prevPose[10][1]

  // 如果当前帧比前一帧低，且y值小于0.4，说明刚过最高点
  if (prevWristY < currentWristY && prevWristY < 0.4) {
    return true
  }

  return false
}
