import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Progress, List, Tag, Spin, Badge, Space, Divider, theme } from 'antd'
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  AimOutlined,
  FireOutlined,
  RiseOutlined,
  DesktopOutlined,
  TrophyOutlined,
  HeartOutlined,
  LineChartOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { Gauge, Area, Radar, Pie, DualAxes } from '@ant-design/plots'
import { dashboardApi, trainingApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { getUserLevelConfig, generateDateRange, shouldTrainOnDay, generateTrainingSession } from '../utils/demoData'
import dayjs from 'dayjs'

interface DashboardStats {
  total_users: number
  active_devices: number
  today_sessions: number
  avg_hit_rate: number
  avg_reaction_time: number
  total_training_hours: number
}

interface TrendData {
  date: string
  avg_hit_rate: number
  avg_reaction_time: number
  sessions: number
}

function Dashboard() {
  const { token } = theme.useToken()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [statsRes, trendsRes]: any[] = await Promise.all([
        dashboardApi.getStats(),
        trainingApi.getTrends(7),
      ])

      const username = user?.username || 'demo1'
      const config = getUserLevelConfig(username)

      // 如果没有API数据，生成最近7天的演示数据
      if (!trendsRes.data || trendsRes.data.length === 0) {
        const last7Days = generateDateRange().slice(-7)
        const generatedTrends = last7Days.map((date, index) => {
          let daySessions = 0
          let totalHitRate = 0
          let totalReactionTime = 0

          const sessionsCount = shouldTrainOnDay(date, config.sessionsPerWeek)
            ? Math.floor(Math.random() * 2) + 1
            : 0

          for (let i = 0; i < sessionsCount; i++) {
            const metrics = generateTrainingSession(date, 66 + index, 73, config)
            totalHitRate += metrics.hit_rate
            totalReactionTime += metrics.reaction_time
            daySessions++
          }

          return {
            date: date.format('MM-DD'),
            avg_hit_rate: daySessions > 0 ? totalHitRate / daySessions : 0,
            avg_reaction_time: daySessions > 0 ? totalReactionTime / daySessions : 0,
            sessions: daySessions,
          }
        })
        setTrends(generatedTrends)
      } else {
        setTrends(trendsRes.data)
      }

      // 使用配置数据或生成统计数据
      setStats(statsRes.data || {
        total_users: 1250,
        active_devices: 2,
        today_sessions: Math.floor(Math.random() * 3) + 1,
        avg_hit_rate: (config.hitRate.min + config.hitRate.max) / 2 + Math.random() * 5 - 2.5,
        avg_reaction_time: (config.reactionTime.min + config.reactionTime.max) / 2 + Math.random() * 20 - 10,
        total_training_hours: config.sessionsPerWeek.min * 12 * 0.6, // 约12周数据
      })
    } catch (err) {
      console.error('获取数据失败', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  // DualAxes v1 API
  const dualAxesConfig = {
    data: [trends, trends],
    xField: 'date',
    yField: ['avg_hit_rate', 'avg_reaction_time'],
    geometryOptions: [
      { geometry: 'line', smooth: true, color: '#1890ff', lineStyle: { lineWidth: 3 } },
      { geometry: 'line', smooth: true, color: '#52c41a', lineStyle: { lineWidth: 3, lineDash: [4, 4] } },
    ],
    height: 280,
  }

  const areaConfig = {
    data: trends,
    xField: 'date',
    yField: 'sessions',
    smooth: true,
    areaStyle: { fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff' },
    line: { color: '#1890ff' },
    height: 180,
  }

  const radarData = [
    { item: '击球准确率', score: stats?.avg_hit_rate || 0 },
    { item: '反应速度', score: Math.max(0, 100 - (stats?.avg_reaction_time || 0) / 10) },
    { item: '训练频率', score: Math.min((stats?.today_sessions || 0) * 10, 100) },
    { item: '持久耐力', score: Math.min((stats?.total_training_hours || 0) * 2, 100) },
    { item: '姿态标准度', score: 85 },
    { item: '体能状态', score: 78 },
  ]

  const radarConfig = {
    data: radarData,
    xField: 'item',
    yField: 'score',
    meta: { score: { min: 0, max: 100 } },
    area: { style: { fillOpacity: 0.3 } },
    point: { size: 3 },
    height: 280,
  }

  const pieConfig = {
    data: [
      { type: '标准训练', value: 65 },
      { type: '强化训练', value: 25 },
      { type: '恢复训练', value: 10 },
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: { type: 'inner', offset: '-50%', content: '{value}%', style: { fontSize: 12 } },
    statistic: {
      title: { content: '' },
      content: { style: { fontSize: '16px', fontWeight: 'bold' }, content: '训练分布' },
    },
    height: 200,
  }

  const gaugeConfig = {
    percent: (stats?.avg_hit_rate || 0) / 100,
    range: { ticks: [0, 0.3, 0.6, 0.8, 1], color: ['#F4664A', '#FAAD14', '#30BF78', '#5B8FF9'] },
    indicator: {
      pointer: { style: { stroke: '#D0D0D0' } },
      pin: { style: { stroke: '#D0D0D0' } },
    },
    statistic: {
      content: {
        formatter: () => `${(stats?.avg_hit_rate || 0).toFixed(1)}%`,
        style: { fontSize: '28px', fontWeight: 'bold', color: '#1890ff' },
      },
      title: { formatter: () => '综合击球率', style: { fontSize: '14px', color: '#8c8c8c' } },
    },
    height: 200,
  }

  const recentActivities = [
    { title: '完成30分钟高强度训练', time: '10分钟前', type: 'success', icon: <CheckCircleOutlined />, extra: '+15 积分' },
    { title: '击球率达到新纪录 87.3%', time: '2小时前', type: 'warning', icon: <TrophyOutlined />, extra: '🏆 成就' },
    { title: '设备 OP-001 完成维护', time: '5小时前', type: 'processing', icon: <DesktopOutlined />, extra: '正常' },
    { title: '本周训练目标达成 (7/7)', time: '昨天', type: 'success', icon: <CalendarOutlined />, extra: '+50 积分' },
    { title: 'AI建议：增加反手训练', time: '2天前', type: 'default', icon: <LineChartOutlined />, extra: '查看' },
  ]

  const weeklyGoals = [
    { name: '训练天数', current: 5, target: 7, unit: '天' },
    { name: '训练时长', current: 180, target: 210, unit: '分钟' },
    { name: '击球次数', current: 850, target: 1000, unit: '次' },
  ]

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2 style={{ margin: 0 }}>
            📊 智能训练仪表盘
            <Badge count="DEMO" style={{ marginLeft: 12, backgroundColor: '#52c41a' }} />
          </h2>
          <p style={{ color: '#8c8c8c', margin: '4px 0 0 0' }}>基于AI的个性化训练数据分析与可视化</p>
        </Col>
        <Col>
          <Space>
            <Tag icon={<ClockCircleOutlined />} color="blue">最后更新: 刚刚</Tag>
            <Tag icon={<UserOutlined />} color="purple">演示用户</Tag>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card" hoverable>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#8c8c8c' }}>今日训练次数</span>}
              value={stats?.today_sessions || 0}
              prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
              suffix="次"
              valueStyle={{ color: '#1890ff', fontSize: 32 }}
            />
            <div style={{ marginTop: 12, fontSize: 12, color: '#52c41a' }}>
              <ArrowUpOutlined /> 较昨日 +20%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card" hoverable>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#8c8c8c' }}>累计训练时长</span>}
              value={(stats?.total_training_hours || 0).toFixed(1)}
              prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="小时"
              valueStyle={{ color: '#52c41a', fontSize: 32 }}
            />
            <div style={{ marginTop: 12, fontSize: 12, color: '#52c41a' }}>
              <ArrowUpOutlined /> 本周 +3.5h
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card" hoverable>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#8c8c8c' }}>平均反应时间</span>}
              value={(stats?.avg_reaction_time || 0).toFixed(0)}
              prefix={<AimOutlined style={{ color: '#faad14' }} />}
              suffix="ms"
              valueStyle={{ color: '#faad14', fontSize: 32 }}
            />
            <div style={{ marginTop: 12, fontSize: 12, color: '#52c41a' }}>
              <ArrowDownOutlined /> 优化 -15ms
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-card" hoverable>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#8c8c8c' }}>在线设备数</span>}
              value={stats?.active_devices || 0}
              prefix={<DesktopOutlined style={{ color: '#722ed1' }} />}
              suffix="/ 2 台"
              valueStyle={{ color: '#722ed1', fontSize: 32 }}
            />
            <div style={{ marginTop: 12, fontSize: 12 }}>
              <span className="status-indicator status-online" />全部在线
            </div>
          </Card>
        </Col>
      </Row>

      <Card title={<><TrophyOutlined style={{ marginRight: 8 }} />本周训练目标</>} className="dashboard-card" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          {weeklyGoals.map((goal, idx) => (
            <Col xs={24} md={8} key={idx}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{goal.name}</span>
                <span style={{ float: 'right', color: '#8c8c8c' }}>{goal.current} / {goal.target} {goal.unit}</span>
              </div>
              <Progress percent={Math.round((goal.current / goal.target) * 100)} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} status={goal.current >= goal.target ? 'success' : 'active'} />
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="综合击球率仪表盘" className="dashboard-card">
            <Gauge {...gaugeConfig} />
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={16} style={{ textAlign: 'center' }}>
              <Col span={12}><div style={{ color: '#8c8c8c', fontSize: 12 }}>目标值</div><div style={{ fontSize: 20, fontWeight: 600, color: '#52c41a' }}>75%</div></Col>
              <Col span={12}><div style={{ color: '#8c8c8c', fontSize: 12 }}>排名</div><div style={{ fontSize: 20, fontWeight: 600, color: '#1890ff' }}>前 15%</div></Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="训练趋势双轴分析 (击球率 vs 反应时间)" className="dashboard-card">
            <DualAxes {...dualAxesConfig} />
            <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c', textAlign: 'center' }}>
              <Space split={<Divider type="vertical" />}>
                <span><span style={{ color: '#1890ff' }}>━━</span> 击球率 (%)</span>
                <span><span style={{ color: '#52c41a' }}>┄┄</span> 反应时间 (ms)</span>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="综合能力雷达图" className="dashboard-card">
            <Radar {...radarConfig} />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Tag color="blue">综合评分: 82/100</Tag>
              <Tag color="green">评级: 优秀</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="训练频次统计" className="dashboard-card">
            <Area {...areaConfig} />
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={16} style={{ textAlign: 'center' }}>
              <Col span={8}><div style={{ color: '#8c8c8c', fontSize: 12 }}>总次数</div><div style={{ fontSize: 18, fontWeight: 600 }}>{trends.reduce((sum, t) => sum + t.sessions, 0)}</div></Col>
              <Col span={8}><div style={{ color: '#8c8c8c', fontSize: 12 }}>日均</div><div style={{ fontSize: 18, fontWeight: 600 }}>{(trends.reduce((sum, t) => sum + t.sessions, 0) / (trends.length || 1)).toFixed(1)}</div></Col>
              <Col span={8}><div style={{ color: '#8c8c8c', fontSize: 12 }}>峰值</div><div style={{ fontSize: 18, fontWeight: 600 }}>{Math.max(...trends.map(t => t.sessions), 0)}</div></Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="训练模式分布" className="dashboard-card">
            <Pie {...pieConfig} />
            <div style={{ marginTop: 16, fontSize: 12, color: '#8c8c8c' }}>💡 建议适当增加强化训练比重</div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="能力象限分析" className="dashboard-card">
            <Row gutter={[12, 12]}>
              {[
                { icon: <HeartOutlined />, name: '体能', level: '优秀', color: '#1890ff' },
                { icon: <ThunderboltOutlined />, name: '速度', level: '良好', color: '#52c41a' },
                { icon: <AimOutlined />, name: '精准', level: '优秀', color: '#faad14' },
                { icon: <FireOutlined />, name: '耐力', level: '良好', color: '#eb2f96' },
              ].map((item, idx) => (
                <Col span={12} key={idx}>
                  <Card
                    size="small"
                    style={{
                      background: token.colorBgContainer,
                      border: `1px solid ${item.color}30`,
                      borderRadius: 8
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 24, color: item.color }}>{item.icon}</span>
                      <div style={{ marginTop: 8, fontWeight: 600, color: token.colorText }}>{item.name}</div>
                      <div style={{ color: item.color, fontSize: 18, fontWeight: 600 }}>{item.level}</div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="最近动态" className="dashboard-card" bodyStyle={{ padding: 0, maxHeight: 320, overflow: 'auto' }}>
            <List size="small" dataSource={recentActivities} renderItem={(item) => (
              <List.Item style={{ padding: '12px 16px', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                <List.Item.Meta
                  avatar={
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: item.type === 'success' ? '#52c41a20' : item.type === 'warning' ? '#faad1420' : '#1890ff20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      color: item.type === 'success' ? '#52c41a' : item.type === 'warning' ? '#faad14' : '#1890ff'
                    }}>
                      {item.icon}
                    </div>
                  }
                  title={<span style={{ fontSize: 13, color: token.colorText }}>{item.title}</span>}
                  description={<span style={{ fontSize: 11, color: token.colorTextSecondary }}><ClockCircleOutlined /> {item.time}</span>}
                />
                <Tag color={item.type} style={{ fontSize: 11 }}>{item.extra}</Tag>
              </List.Item>
            )} />
          </Card>
        </Col>
      </Row>

      <Card title={<Space><RiseOutlined style={{ color: '#1890ff' }} /><span>AI个性化建议</span><Badge count="NEW" style={{ backgroundColor: '#52c41a' }} /></Space>} className="dashboard-card" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          {[
            { icon: <ThunderboltOutlined style={{ fontSize: 20, color: '#667eea' }} />, title: '训练强度建议', desc: '当前强度适中，建议下次训练可提升10%球速', borderColor: '#667eea' },
            { icon: <AimOutlined style={{ fontSize: 20, color: '#f5576c' }} />, title: '技术优化方向', desc: '反手击球准确率提升空间大，建议增加专项练习', borderColor: '#f5576c' },
            { icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#4facfe' }} />, title: '最佳训练时段', desc: '基于历史数据，您在下午4-6点表现最佳', borderColor: '#4facfe' },
          ].map((item, idx) => (
            <Col xs={24} md={8} key={idx}>
              <div style={{
                padding: 16,
                background: token.colorBgContainer,
                borderRadius: 8,
                border: `1px solid ${item.borderColor}30`,
                borderLeft: `3px solid ${item.borderColor}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {item.icon}
                  <span style={{ fontSize: 15, fontWeight: 600, color: token.colorText }}>{item.title}</span>
                </div>
                <div style={{ fontSize: 13, color: token.colorTextSecondary, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}

export default Dashboard
