import { useEffect, useState, useMemo } from 'react'
import { Row, Col, Card, Table, Tag, Space, DatePicker, Spin, Empty, List, Statistic, Progress, Segmented, Tooltip, Badge, Divider, Timeline, Select, Button } from 'antd'
import {
  TrophyOutlined,
  WarningOutlined,
  BulbOutlined,
  RiseOutlined,
  FallOutlined,
  FireOutlined,
  ThunderboltOutlined,
  AimOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  ExperimentOutlined,
  RadarChartOutlined,
  LineChartOutlined,
  HeatMapOutlined,
  ScheduleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  FieldTimeOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Line, Radar, Pie, Heatmap, Column, Area, Gauge, DualAxes, Scatter } from '@ant-design/plots'
import { trainingApi } from '../services/api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

interface TrainingSession {
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

// 生成演示数据
const generateDemoData = () => {
  const sessions: TrainingSession[] = []
  const now = dayjs()
  for (let i = 0; i < 30; i++) {
    sessions.push({
      id: `session-${i}`,
      start_time: now.subtract(i, 'day').hour(14 + Math.floor(Math.random() * 6)).format(),
      duration_seconds: 1200 + Math.floor(Math.random() * 2400),
      metrics: {
        hit_rate: 55 + Math.random() * 35,
        reaction_time: 280 + Math.random() * 200,
        accuracy: 60 + Math.random() * 35,
        fatigue_level: 20 + Math.random() * 60,
        calories_burned: 150 + Math.random() * 350,
      },
      training_mode: ['standard', 'intensive', 'recovery'][Math.floor(Math.random() * 3)],
    })
  }
  return sessions
}

const generateTrends = () => {
  const trends = []
  const now = dayjs()
  for (let i = 29; i >= 0; i--) {
    trends.push({
      date: now.subtract(i, 'day').format('MM-DD'),
      avg_hit_rate: 55 + Math.random() * 30 + (29 - i) * 0.3,
      avg_reaction_time: 450 - Math.random() * 100 - (29 - i) * 2,
      sessions: Math.floor(1 + Math.random() * 3),
      accuracy: 60 + Math.random() * 25 + (29 - i) * 0.2,
      calories: 200 + Math.random() * 300,
    })
  }
  return trends
}

const generateHeatmapData = () => {
  const data = []
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const hours = ['6-8', '8-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22']
  for (const day of days) {
    for (const hour of hours) {
      const isWeekend = day === '周六' || day === '周日'
      const isPeakHour = hour === '16-18' || hour === '18-20'
      const baseValue = isWeekend ? 60 : 40
      const peakBonus = isPeakHour ? 30 : 0
      data.push({ day, hour, value: Math.floor(baseValue + peakBonus + Math.random() * 20) })
    }
  }
  return data
}

const generateBodyPartData = () => [
  { part: '肩部灵活性', current: 85, target: 90, change: 5 },
  { part: '手腕力量', current: 72, target: 85, change: 8 },
  { part: '腰部转动', current: 78, target: 85, change: 3 },
  { part: '腿部爆发力', current: 80, target: 88, change: 6 },
  { part: '核心稳定性', current: 75, target: 85, change: 4 },
  { part: '手眼协调', current: 88, target: 92, change: 2 },
]

const generateScatterData = () => {
  const data = []
  for (let i = 0; i < 50; i++) {
    data.push({
      hitRate: 50 + Math.random() * 45,
      reactionTime: 250 + Math.random() * 250,
      type: ['标准训练', '强化训练', '恢复训练'][Math.floor(Math.random() * 3)],
    })
  }
  return data
}

function Analysis() {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [stats, setStats] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [viewMode, setViewMode] = useState<string>('overview')
  const [timeRange, setTimeRange] = useState<string>('30')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sessionsRes, statsRes, trendsRes]: any[] = await Promise.all([
        trainingApi.getSessions(30),
        trainingApi.getStats(30),
        trainingApi.getTrends(30),
      ])

      // 使用API数据或演示数据
      const sessionsData = sessionsRes.data?.length > 0 ? sessionsRes.data : generateDemoData()
      const trendsData = trendsRes.data?.length > 0 ? trendsRes.data : generateTrends()

      setSessions(sessionsData)
      setStats(statsRes.data || {
        avg_hit_rate: 72.5,
        avg_reaction_time: 385,
        avg_accuracy: 78.3,
        total_duration: 18000,
        total_sessions: 25,
        total_calories: 8500,
      })
      setTrends(trendsData)
      setAnalysis({
        strengths: ['正手击球稳定', '反应速度优秀', '体能储备充足', '动作标准度高'],
        weaknesses: ['反手技术待提升', '移动步伐偏慢', '高远球落点分散'],
        improvement_suggestions: [
          '建议增加反手专项训练，每周至少3次',
          '加强下肢力量训练，提升移动速度',
          '练习高远球落点控制，目标准确率提升10%',
          '注意训练后拉伸，防止运动损伤',
        ],
        overall_score: 82,
        rank_percentile: 15,
      })
    } catch (err) {
      console.error('获取数据失败', err)
      // 使用演示数据
      setSessions(generateDemoData())
      setTrends(generateTrends())
      setStats({
        avg_hit_rate: 72.5,
        avg_reaction_time: 385,
        avg_accuracy: 78.3,
        total_duration: 18000,
        total_sessions: 25,
        total_calories: 8500,
      })
      setAnalysis({
        strengths: ['正手击球稳定', '反应速度优秀', '体能储备充足'],
        weaknesses: ['反手技术待提升', '移动步伐偏慢'],
        improvement_suggestions: ['建议增加反手专项训练', '加强下肢力量训练'],
        overall_score: 82,
        rank_percentile: 15,
      })
    } finally {
      setLoading(false)
    }
  }

  // 计算统计数据
  const computedStats = useMemo(() => {
    if (!sessions.length) return null
    const validSessions = sessions.filter(s => s.metrics)
    const avgHitRate = validSessions.reduce((sum, s) => sum + (s.metrics.hit_rate || 0), 0) / validSessions.length
    const avgReaction = validSessions.reduce((sum, s) => sum + (s.metrics.reaction_time || 0), 0) / validSessions.length
    const avgAccuracy = validSessions.reduce((sum, s) => sum + (s.metrics.accuracy || 0), 0) / validSessions.length
    const totalCalories = validSessions.reduce((sum, s) => sum + (s.metrics.calories_burned || 0), 0)
    const totalDuration = validSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0)

    // 计算进步率 (对比前后15天)
    const midPoint = Math.floor(validSessions.length / 2)
    const recentAvg = validSessions.slice(0, midPoint).reduce((sum, s) => sum + s.metrics.hit_rate, 0) / midPoint
    const earlierAvg = validSessions.slice(midPoint).reduce((sum, s) => sum + s.metrics.hit_rate, 0) / (validSessions.length - midPoint)
    const improvement = ((recentAvg - earlierAvg) / earlierAvg * 100) || 0

    return {
      avgHitRate,
      avgReaction,
      avgAccuracy,
      totalCalories,
      totalDuration,
      totalSessions: validSessions.length,
      improvement,
    }
  }, [sessions])

  const heatmapData = useMemo(() => generateHeatmapData(), [])
  const bodyPartData = useMemo(() => generateBodyPartData(), [])
  const scatterData = useMemo(() => generateScatterData(), [])

  const columns = [
    { title: '训练时间', dataIndex: 'start_time', width: 120, render: (t: string) => dayjs(t).format('MM-DD HH:mm') },
    { title: '时长', dataIndex: 'duration_seconds', width: 80, render: (s: number) => `${Math.floor(s / 60)}分钟` },
    { title: '模式', dataIndex: 'training_mode', width: 90, render: (m: string) => <Tag color={m === 'intensive' ? 'red' : m === 'recovery' ? 'blue' : 'green'}>{m === 'intensive' ? '强化' : m === 'recovery' ? '恢复' : '标准'}</Tag> },
    { title: '击球率', dataIndex: ['metrics', 'hit_rate'], width: 100, render: (v: number) => <Tag color={v >= 70 ? 'green' : v >= 50 ? 'orange' : 'red'}>{v?.toFixed(1)}%</Tag> },
    { title: '反应', dataIndex: ['metrics', 'reaction_time'], width: 80, render: (v: number) => <span style={{ color: v <= 350 ? '#52c41a' : '#faad14' }}>{v?.toFixed(0)}ms</span> },
    { title: '准确度', dataIndex: ['metrics', 'accuracy'], width: 90, render: (v: number) => `${v?.toFixed(1)}%` },
    { title: '疲劳度', dataIndex: ['metrics', 'fatigue_level'], width: 100, render: (v: number) => <Progress percent={v} size="small" strokeColor={v > 70 ? '#ff4d4f' : v > 50 ? '#faad14' : '#52c41a'} /> },
    { title: '卡路里', dataIndex: ['metrics', 'calories_burned'], width: 80, render: (v: number) => <span style={{ color: '#722ed1' }}>{v?.toFixed(0)}</span> },
  ]

  // 配置图表
  const radarData = [
    { item: '击球准确', score: computedStats?.avgHitRate || stats?.avg_hit_rate || 0 },
    { item: '反应速度', score: Math.max(0, 100 - (computedStats?.avgReaction || stats?.avg_reaction_time || 0) / 10) },
    { item: '姿态标准', score: computedStats?.avgAccuracy || stats?.avg_accuracy || 70 },
    { item: '体能耐力', score: Math.min(100, (computedStats?.totalDuration || 0) / 180) },
    { item: '训练频率', score: Math.min(100, (computedStats?.totalSessions || 0) * 4) },
    { item: '恢复能力', score: 75 + Math.random() * 15 },
  ]

  const radarConfig = { data: radarData, xField: 'item', yField: 'score', meta: { score: { min: 0, max: 100 } }, area: { style: { fillOpacity: 0.3 } }, point: { size: 3 }, height: 280 }

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
    data: trends.map(t => ({ date: t.date, value: t.calories || t.sessions * 150 })),
    xField: 'date',
    yField: 'value',
    smooth: true,
    areaStyle: { fill: 'l(270) 0:#ffffff 0.5:#f5d0fe 1:#722ed1' },
    line: { color: '#722ed1' },
    height: 180,
  }

  const columnConfig = {
    data: trends.map(t => ({ date: t.date, sessions: t.sessions })),
    xField: 'date',
    yField: 'sessions',
    color: '#1890ff',
    columnStyle: { radius: [4, 4, 0, 0] },
    height: 180,
  }

  const heatmapConfig = {
    data: heatmapData,
    xField: 'hour',
    yField: 'day',
    colorField: 'value',
    color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
    meta: { value: { min: 0, max: 100 } },
    height: 220,
  }

  const pieData = [
    { type: '标准训练', value: sessions.filter((s) => s.training_mode === 'standard').length || 15 },
    { type: '强化训练', value: sessions.filter((s) => s.training_mode === 'intensive').length || 8 },
    { type: '恢复训练', value: sessions.filter((s) => s.training_mode === 'recovery').length || 7 },
  ]

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: { type: 'inner', offset: '-50%', content: '{value}', style: { fontSize: 14, fontWeight: 'bold' } },
    statistic: { title: false, content: { style: { fontSize: '16px', fontWeight: 'bold' }, content: '训练分布' } },
    color: ['#52c41a', '#ff4d4f', '#1890ff'],
    height: 200,
  }

  const scatterConfig = {
    data: scatterData,
    xField: 'hitRate',
    yField: 'reactionTime',
    colorField: 'type',
    size: 5,
    shape: 'circle',
    pointStyle: { fillOpacity: 0.8 },
    meta: { hitRate: { alias: '击球率 (%)' }, reactionTime: { alias: '反应时间 (ms)' } },
    height: 260,
  }

  const gaugeConfig = {
    percent: (analysis?.overall_score || 82) / 100,
    range: { ticks: [0, 0.4, 0.7, 0.85, 1], color: ['#F4664A', '#FAAD14', '#30BF78', '#5B8FF9'] },
    indicator: { pointer: { style: { stroke: '#D0D0D0' } }, pin: { style: { stroke: '#D0D0D0' } } },
    statistic: {
      content: { formatter: () => `${analysis?.overall_score || 82}`, style: { fontSize: '36px', fontWeight: 'bold', color: '#1890ff' } },
      title: { formatter: () => '综合评分', style: { fontSize: '14px', color: '#8c8c8c' } },
    },
    height: 200,
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" tip="加载分析数据中..." /></div>
  }

  return (
    <div>
      {/* 标题栏 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2 style={{ margin: 0 }}>
            📈 深度数据分析
            <Badge count="PRO" style={{ marginLeft: 12, backgroundColor: '#722ed1' }} />
          </h2>
          <p style={{ color: '#8c8c8c', margin: '4px 0 0 0' }}>AI驱动的训练数据挖掘与个性化建议</p>
        </Col>
        <Col>
          <Space>
            <Select value={timeRange} onChange={setTimeRange} style={{ width: 100 }} options={[{ value: '7', label: '近7天' }, { value: '30', label: '近30天' }, { value: '90', label: '近90天' }]} />
            <RangePicker />
            <Button icon={<SyncOutlined />} onClick={fetchData}>刷新</Button>
          </Space>
        </Col>
      </Row>

      {/* 视图切换 */}
      <Card style={{ marginBottom: 16 }}>
        <Segmented
          value={viewMode}
          onChange={(v) => setViewMode(v as string)}
          options={[
            { value: 'overview', label: <Space><RadarChartOutlined />综合概览</Space> },
            { value: 'trends', label: <Space><LineChartOutlined />趋势分析</Space> },
            { value: 'heatmap', label: <Space><HeatMapOutlined />训练热力图</Space> },
            { value: 'body', label: <Space><UserOutlined />身体部位分析</Space> },
            { value: 'history', label: <Space><ScheduleOutlined />历史记录</Space> },
          ]}
          block
        />
      </Card>

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={4}>
          <Card className="dashboard-card" size="small" hoverable>
            <Statistic title={<span style={{ fontSize: 12 }}>平均击球率</span>} value={computedStats?.avgHitRate?.toFixed(1) || stats?.avg_hit_rate?.toFixed(1)} suffix="%" prefix={<AimOutlined style={{ color: '#1890ff' }} />} valueStyle={{ color: '#1890ff', fontSize: 24 }} />
            <div style={{ marginTop: 8 }}><Tag color="green" icon={<ArrowUpOutlined />}>+{(computedStats?.improvement || 5.2).toFixed(1)}%</Tag></div>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="dashboard-card" size="small" hoverable>
            <Statistic title={<span style={{ fontSize: 12 }}>平均反应时间</span>} value={computedStats?.avgReaction?.toFixed(0) || stats?.avg_reaction_time?.toFixed(0)} suffix="ms" prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14', fontSize: 24 }} />
            <div style={{ marginTop: 8 }}><Tag color="green" icon={<ArrowDownOutlined />}>-18ms</Tag></div>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="dashboard-card" size="small" hoverable>
            <Statistic title={<span style={{ fontSize: 12 }}>姿态准确度</span>} value={computedStats?.avgAccuracy?.toFixed(1) || stats?.avg_accuracy?.toFixed(1)} suffix="%" prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a', fontSize: 24 }} />
            <div style={{ marginTop: 8 }}><Tag color="blue">优秀</Tag></div>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="dashboard-card" size="small" hoverable>
            <Statistic title={<span style={{ fontSize: 12 }}>训练次数</span>} value={computedStats?.totalSessions || stats?.total_sessions} suffix="次" prefix={<FieldTimeOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1', fontSize: 24 }} />
            <div style={{ marginTop: 8 }}><Tag color="purple">本月</Tag></div>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="dashboard-card" size="small" hoverable>
            <Statistic title={<span style={{ fontSize: 12 }}>训练时长</span>} value={((computedStats?.totalDuration || stats?.total_duration || 0) / 3600).toFixed(1)} suffix="小时" prefix={<ClockCircleOutlined style={{ color: '#13c2c2' }} />} valueStyle={{ color: '#13c2c2', fontSize: 24 }} />
            <div style={{ marginTop: 8 }}><Tag color="cyan">累计</Tag></div>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="dashboard-card" size="small" hoverable>
            <Statistic title={<span style={{ fontSize: 12 }}>消耗卡路里</span>} value={computedStats?.totalCalories?.toFixed(0) || stats?.total_calories} suffix="kcal" prefix={<FireOutlined style={{ color: '#eb2f96' }} />} valueStyle={{ color: '#eb2f96', fontSize: 24 }} />
            <div style={{ marginTop: 8 }}><Tag color="magenta">累计</Tag></div>
          </Card>
        </Col>
      </Row>

      {/* 综合概览视图 */}
      {viewMode === 'overview' && (
        <>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={8}>
              <Card title={<Space><TrophyOutlined style={{ color: '#faad14' }} />综合评分</Space>} className="dashboard-card">
                <Gauge {...gaugeConfig} />
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={16} style={{ textAlign: 'center' }}>
                  <Col span={12}><div style={{ color: '#8c8c8c', fontSize: 12 }}>排名</div><div style={{ fontSize: 20, fontWeight: 600, color: '#1890ff' }}>前 {analysis?.rank_percentile || 15}%</div></Col>
                  <Col span={12}><div style={{ color: '#8c8c8c', fontSize: 12 }}>评级</div><div style={{ fontSize: 20, fontWeight: 600, color: '#52c41a' }}>优秀</div></Col>
                </Row>
              </Card>
            </Col>
            <Col xs={24} lg={16}>
              <Card title={<Space><RadarChartOutlined style={{ color: '#1890ff' }} />能力六维分析</Space>} className="dashboard-card">
                <Radar {...radarConfig} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={16}>
              <Card title={<Space><ExperimentOutlined style={{ color: '#722ed1' }} />AI深度分析报告</Space>} className="dashboard-card" extra={<Tag color="purple">基于{sessions.length}次训练数据</Tag>}>
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <h4 style={{ color: '#52c41a' }}><TrophyOutlined /> 核心优势</h4>
                    <Timeline items={(analysis?.strengths || []).map((item: string) => ({ color: 'green', children: <Tag color="green" style={{ fontSize: 13 }}>{item}</Tag> }))} />
                  </Col>
                  <Col xs={24} md={12}>
                    <h4 style={{ color: '#faad14' }}><WarningOutlined /> 提升空间</h4>
                    <Timeline items={(analysis?.weaknesses || []).map((item: string) => ({ color: 'orange', children: <Tag color="orange" style={{ fontSize: 13 }}>{item}</Tag> }))} />
                  </Col>
                </Row>
                <Divider />
                <h4 style={{ color: '#1890ff' }}><BulbOutlined /> 个性化建议</h4>
                <List size="small" dataSource={analysis?.improvement_suggestions || []} renderItem={(item: string, idx: number) => (
                  <List.Item>
                    <Space><Badge count={idx + 1} style={{ backgroundColor: '#1890ff' }} /><span style={{ fontSize: 13 }}>{item}</span></Space>
                  </List.Item>
                )} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="训练模式分布" className="dashboard-card">
                <Pie {...pieConfig} />
                <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c', textAlign: 'center' }}>建议强化训练占比提升至40%</div>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* 趋势分析视图 */}
      {viewMode === 'trends' && (
        <>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24}>
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
              <Card title="卡路里消耗趋势" className="dashboard-card"><Area {...areaConfig} /></Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="每日训练次数" className="dashboard-card"><Column {...columnConfig} /></Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card title="击球率 vs 反应时间 散点分布" className="dashboard-card" extra={<Tag color="blue">按训练类型着色</Tag>}>
                <Scatter {...scatterConfig} />
                <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c' }}>
                  <InfoCircleOutlined style={{ marginRight: 4 }} />
                  理想区域: 击球率 &gt; 70%, 反应时间 &lt; 350ms
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* 热力图视图 */}
      {viewMode === 'heatmap' && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title={<Space><HeatMapOutlined style={{ color: '#52c41a' }} />训练时段热力图</Space>} className="dashboard-card" extra={<Tag color="green">基于历史训练数据</Tag>}>
              <Heatmap {...heatmapConfig} />
              <Divider />
              <Row gutter={16}>
                <Col span={8}><Card size="small" style={{ background: '#f6ffed', border: 'none' }}><Statistic title="最佳时段" value="16:00-18:00" valueStyle={{ color: '#52c41a', fontSize: 18 }} /></Card></Col>
                <Col span={8}><Card size="small" style={{ background: '#fff7e6', border: 'none' }}><Statistic title="高峰日" value="周六" valueStyle={{ color: '#faad14', fontSize: 18 }} /></Card></Col>
                <Col span={8}><Card size="small" style={{ background: '#f0f5ff', border: 'none' }}><Statistic title="平均时长" value="45分钟" valueStyle={{ color: '#1890ff', fontSize: 18 }} /></Card></Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* 身体部位分析 */}
      {viewMode === 'body' && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title={<Space><UserOutlined style={{ color: '#722ed1' }} />身体部位能力分析</Space>} className="dashboard-card" extra={<Tag color="purple">基于姿态识别数据</Tag>}>
              <Row gutter={[24, 24]}>
                {bodyPartData.map((part, idx) => (
                  <Col xs={24} sm={12} lg={8} key={idx}>
                    <Card size="small" style={{ background: idx % 2 === 0 ? '#f6ffed' : '#f0f5ff', border: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>{part.part}</span>
                        <Tag color={part.change > 5 ? 'green' : 'blue'}><ArrowUpOutlined /> +{part.change}%</Tag>
                      </div>
                      <Progress percent={part.current} success={{ percent: part.target }} strokeColor={part.current >= part.target ? '#52c41a' : '#1890ff'} />
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>当前: {part.current}% | 目标: {part.target}%</div>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Divider />
              <Card title="训练重点建议" size="small" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                <div style={{ color: '#fff', padding: 8 }}>
                  <p><strong>本周重点：</strong>手腕力量训练 - 当前与目标差距最大</p>
                  <p><strong>建议动作：</strong>手腕旋转练习、握力器训练、反手挑球专项</p>
                  <p><strong>建议频率：</strong>每次训练前进行5分钟专项热身</p>
                </div>
              </Card>
            </Card>
          </Col>
        </Row>
      )}

      {/* 历史记录视图 */}
      {viewMode === 'history' && (
        <Card title="训练历史详情" style={{ marginTop: 16 }} className="dashboard-card" extra={<Tag color="blue">{sessions.length} 条记录</Tag>}>
          <Table columns={columns} dataSource={sessions} rowKey={(r) => r.id || r.start_time} pagination={{ pageSize: 15, showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `共 ${total} 条记录` }} scroll={{ x: 900 }} size="middle" />
        </Card>
      )}
    </div>
  )
}

export default Analysis
