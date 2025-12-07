import { useEffect, useRef, useState, useCallback } from 'react'
import { Row, Col, Card, Button, Statistic, Progress, Select, Space, Alert, Tag, Divider, Badge } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Liquid, Gauge } from '@ant-design/plots'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Line, Text } from '@react-three/drei'
import { useTrainingStore } from '../stores/trainingStore'
import { useAuthStore } from '../stores/authStore'
import { getUserLevelConfig } from '../utils/demoData'
import { trainingApi, deviceApi } from '../services/api'
import { wsService } from '../services/websocket'
import * as THREE from 'three'

const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
  [15, 17], [15, 19], [17, 19], [16, 18], [16, 20], [18, 20],
  [27, 29], [29, 31], [28, 30], [30, 32],
]

const DEMO_POSE_FRAMES = generateDemoPoseFrames()

function generateDemoPoseFrames(): number[][][] {
  const frames: number[][][] = []
  for (let f = 0; f < 120; f++) {
    const t = f / 120
    const phase = Math.sin(t * Math.PI * 4)
    const sway = Math.sin(t * Math.PI * 2) * 0.05
    const keypoints: number[][] = []
    for (let i = 0; i < 33; i++) {
      let x = 0.5, y = 0.5, z = 0
      if (i === 0) { x = 0.5 + sway * 0.5; y = 0.15; z = 0 }
      else if (i === 11) { x = 0.35; y = 0.3 + phase * 0.02; z = 0 }
      else if (i === 12) { x = 0.65; y = 0.3 + phase * 0.02; z = 0 }
      else if (i === 13) { x = 0.25 + phase * 0.1; y = 0.4 + phase * 0.15; z = -0.1 - phase * 0.2 }
      else if (i === 14) { x = 0.75; y = 0.45; z = 0.05 }
      else if (i === 15) { x = 0.15 + phase * 0.2; y = 0.35 + phase * 0.25; z = -0.2 - phase * 0.3 }
      else if (i === 16) { x = 0.8; y = 0.55; z = 0.1 }
      else if (i === 23) { x = 0.4; y = 0.55 + sway * 0.5; z = 0 }
      else if (i === 24) { x = 0.6; y = 0.55 + sway * 0.5; z = 0 }
      else if (i === 25) { x = 0.38 + sway; y = 0.75; z = 0.05 }
      else if (i === 26) { x = 0.62 - sway; y = 0.72; z = -0.05 }
      else if (i === 27) { x = 0.35 + sway; y = 0.95; z = 0.02 }
      else if (i === 28) { x = 0.65 - sway; y = 0.92; z = -0.02 }
      else if (i >= 1 && i <= 10) { x = 0.5 + (i % 2 === 0 ? 0.03 : -0.03); y = 0.12 + i * 0.008; z = 0 }
      else { x = 0.5; y = 0.5 + i * 0.01; z = 0 }
      keypoints.push([x, y, z, 0.95])
    }
    frames.push(keypoints)
  }
  return frames
}

function CameraController({ resetTrigger }: { resetTrigger: number }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  useEffect(() => {
    if (resetTrigger > 0 && controlsRef.current) {
      camera.position.set(0, 0, 2.5)
      camera.lookAt(0, 0, 0)
      controlsRef.current.reset()
    }
  }, [resetTrigger, camera])
  return <OrbitControls ref={controlsRef} enablePan={false} maxDistance={5} minDistance={1} />
}

function PoseSkeleton({ keypoints }: { keypoints: number[][] | null }) {
  if (!keypoints || keypoints.length < 33) return null
  const points = keypoints.map(([x, y, z]) => new THREE.Vector3((x - 0.5) * 2, -(y - 0.5) * 2, z * 2))
  const getColor = (idx: number) => idx <= 10 ? '#ff6b6b' : idx <= 22 ? '#4ecdc4' : '#45b7d1'
  return (
    <group>
      {points.map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color={getColor(i)} emissive={getColor(i)} emissiveIntensity={0.3} />
        </mesh>
      ))}
      {POSE_CONNECTIONS.map(([start, end], i) => {
        if (start >= points.length || end >= points.length) return null
        return <Line key={i} points={[points[start], points[end]]} color="#ffffff" lineWidth={2} />
      })}
      <Text position={[0, 1.1, 0]} fontSize={0.08} color="#52c41a" anchorX="center">实时姿态追踪</Text>
    </group>
  )
}

function Floor() {
  return (
    <group>
      <gridHelper args={[3, 15, '#333', '#222']} rotation={[Math.PI / 2, 0, 0]} position={[0, -1, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.01, 0]} receiveShadow>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

function Training() {
  const { user } = useAuthStore()
  const [devices, setDevices] = useState<any[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [sessionTime, setSessionTime] = useState(0)
  const [demoMode, setDemoMode] = useState(false)
  const [demoFrame, setDemoFrame] = useState(0)
  const [resetTrigger, setResetTrigger] = useState(0)
  const timerRef = useRef<number | null>(null)
  const demoTimerRef = useRef<number | null>(null)
  const { isTraining, currentSessionId, realtimeMetrics, poseData, startTraining, stopTraining, updateMetrics, updatePoseData } = useTrainingStore()

  useEffect(() => {
    loadDevices()
    const unsubPose = wsService.subscribe('pose_update', (data: any) => { if (data.data?.keypoints) updatePoseData(data.data.keypoints) })
    const unsubMetrics = wsService.subscribe('metrics_update', (data: any) => {
      if (data.data) updateMetrics({ hitRate: data.data.hit_rate || 0, reactionTime: data.data.reaction_time || 0, accuracy: data.data.accuracy || 0, fatigueLevel: data.data.fatigue_level || 0 })
    })
    return () => { unsubPose(); unsubMetrics(); if (timerRef.current) clearInterval(timerRef.current); if (demoTimerRef.current) clearInterval(demoTimerRef.current) }
  }, [])

  useEffect(() => {
    if (demoMode) {
      const username = user?.username || 'demo1'
      const config = getUserLevelConfig(username)

      demoTimerRef.current = window.setInterval(() => setDemoFrame((f) => (f + 1) % DEMO_POSE_FRAMES.length), 50)
      const metricsTimer = window.setInterval(() => {
        // 根据用户水平动态调整实时数据范围
        const hitRate = config.hitRate.min + Math.random() * (config.hitRate.max - config.hitRate.min)
        const reactionTime = config.reactionTime.min + Math.random() * (config.reactionTime.max - config.reactionTime.min)
        const accuracy = config.accuracy.min + Math.random() * (config.accuracy.max - config.accuracy.min)
        const fatigueLevel = Math.min(80, config.fatigueLevel.min + sessionTime / 10)
        const caloriesBurned = sessionTime * 0.15

        updateMetrics({
          hitRate,
          reactionTime,
          accuracy,
          fatigueLevel,
          caloriesBurned
        })
      }, 1000)
      return () => { if (demoTimerRef.current) clearInterval(demoTimerRef.current); clearInterval(metricsTimer) }
    }
  }, [demoMode, sessionTime, user])

  useEffect(() => { if (demoMode) updatePoseData(DEMO_POSE_FRAMES[demoFrame]) }, [demoFrame, demoMode])

  const loadDevices = async () => {
    try { const res: any = await deviceApi.getMyDevices(); setDevices(res.data || []); if (res.data?.length > 0) setSelectedDevice(res.data[0].device_id) }
    catch (err) { console.error('加载设备失败', err) }
  }

  const handleStart = async () => {
    if (!selectedDevice) return
    try {
      const res: any = await trainingApi.startSession(selectedDevice)
      startTraining(res.data.id || res.data._id)
      wsService.subscribeDevice(selectedDevice)
      setSessionTime(0)
      timerRef.current = window.setInterval(() => setSessionTime((t) => t + 1), 1000)
    } catch (err) { console.error('启动训练失败', err) }
  }

  const handleStop = async () => {
    if (!currentSessionId) return
    try {
      await trainingApi.endSession(currentSessionId, { hit_rate: realtimeMetrics.hitRate, reaction_time: realtimeMetrics.reactionTime, accuracy: realtimeMetrics.accuracy, fatigue_level: realtimeMetrics.fatigueLevel, calories_burned: realtimeMetrics.caloriesBurned, total_hits: 0, successful_hits: 0 })
      stopTraining()
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    } catch (err) { console.error('结束训练失败', err) }
  }

  const startDemo = () => {
    const username = user?.username || 'demo1'
    const config = getUserLevelConfig(username)

    setDemoMode(true)
    setSessionTime(0)
    timerRef.current = window.setInterval(() => setSessionTime((t) => t + 1), 1000)

    // 初始化数据根据用户水平
    updateMetrics({
      hitRate: config.hitRate.min + Math.random() * 10,
      reactionTime: config.reactionTime.max - Math.random() * 20,
      accuracy: config.accuracy.min + Math.random() * 10,
      fatigueLevel: config.fatigueLevel.min,
      caloriesBurned: 0
    })
  }
  const stopDemo = () => { setDemoMode(false); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }; updatePoseData([]) }
  const resetCamera = useCallback(() => setResetTrigger((t) => t + 1), [])
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  const isActive = isTraining || demoMode

  const liquidConfig = { percent: realtimeMetrics.fatigueLevel / 100, outline: { border: 2, distance: 4 }, wave: { length: 128 }, statistic: { content: { formatter: () => `${realtimeMetrics.fatigueLevel.toFixed(0)}%`, style: { fontSize: '20px' } }, title: { formatter: () => '疲劳度', style: { fontSize: '12px' } } }, height: 140, color: realtimeMetrics.fatigueLevel > 70 ? '#ff4d4f' : realtimeMetrics.fatigueLevel > 50 ? '#faad14' : '#1890ff' }
  const gaugeConfig = { percent: realtimeMetrics.accuracy / 100, range: { color: 'l(0) 0:#30BF78 1:#1890ff' }, indicator: { pointer: { style: { stroke: '#D0D0D0' } }, pin: { style: { stroke: '#D0D0D0' } } }, statistic: { content: { formatter: () => `${realtimeMetrics.accuracy.toFixed(1)}%`, style: { fontSize: '18px', fontWeight: 'bold' } }, title: { formatter: () => '姿态准确度', style: { fontSize: '11px' } } }, height: 140 }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2 style={{ margin: 0 }}>🏸 实时训练监测{demoMode && <Badge count="演示模式" style={{ marginLeft: 12, backgroundColor: '#722ed1' }} />}</h2>
          <p style={{ color: '#8c8c8c', margin: '4px 0 0 0' }}>MediaPipe 33关键点姿态分析 · AI实时反馈</p>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <Select style={{ width: 200 }} placeholder="选择训练设备" value={selectedDevice} onChange={setSelectedDevice} disabled={isActive} options={devices.map((d) => ({ value: d.device_id, label: <Space><span className={`status-indicator ${d.status === 'online' ? 'status-online' : 'status-offline'}`} />{d.name}</Space> }))} />
              {isTraining ? <Button type="primary" danger icon={<PauseCircleOutlined />} onClick={handleStop} size="large">结束训练</Button> : <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStart} disabled={!selectedDevice || demoMode} size="large">开始训练</Button>}
              <Divider type="vertical" />
              {demoMode ? <Button icon={<PauseCircleOutlined />} onClick={stopDemo} size="large">停止演示</Button> : <Button type="dashed" icon={<VideoCameraOutlined />} onClick={startDemo} disabled={isTraining} size="large">演示模式</Button>}
            </Space>
          </Col>
          <Col>
            <Space size="large">
              <Statistic title="训练时长" value={formatTime(sessionTime)} prefix={<ThunderboltOutlined />} />
              <Tag color={isActive ? 'green' : 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>{isActive ? (demoMode ? '演示中' : '训练中') : '待机'}</Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card title={<Space><EyeOutlined /> 实时姿态监测 <Tag color="blue">3D可视化</Tag></Space>} extra={<Button icon={<ReloadOutlined />} size="small" onClick={resetCamera}>重置视角</Button>} style={{ height: 520 }} bodyStyle={{ height: 460, padding: 0, background: '#0d1117', position: 'relative' }}>
            <Canvas camera={{ position: [0, 0, 2.5], fov: 55 }} shadows>
              <color attach="background" args={['#0d1117']} />
              <ambientLight intensity={0.4} />
              <pointLight position={[5, 5, 5]} intensity={0.8} castShadow />
              <pointLight position={[-5, 5, -5]} intensity={0.4} />
              <PoseSkeleton keypoints={poseData} />
              <Floor />
              <CameraController resetTrigger={resetTrigger} />
            </Canvas>
            {!isActive && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#8c8c8c', pointerEvents: 'none' }}><ThunderboltOutlined style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }} /><p style={{ fontSize: 16 }}>点击"演示模式"查看实时姿态效果</p><p style={{ fontSize: 12, opacity: 0.6 }}>或连接设备开始真实训练</p></div>}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Row gutter={[16, 16]}>
            <Col span={12}><Card className="dashboard-card" size="small"><Statistic title="击球回传率" value={realtimeMetrics.hitRate} precision={1} suffix="%" valueStyle={{ color: realtimeMetrics.hitRate >= 60 ? '#52c41a' : '#faad14', fontSize: 28 }} /><Progress percent={realtimeMetrics.hitRate} showInfo={false} strokeColor={realtimeMetrics.hitRate >= 60 ? '#52c41a' : '#faad14'} size="small" /></Card></Col>
            <Col span={12}><Card className="dashboard-card" size="small"><Statistic title="反应时间" value={realtimeMetrics.reactionTime} precision={0} suffix="ms" valueStyle={{ color: realtimeMetrics.reactionTime <= 400 ? '#52c41a' : '#ff4d4f', fontSize: 28 }} /><Progress percent={Math.max(0, 100 - realtimeMetrics.reactionTime / 10)} showInfo={false} strokeColor={realtimeMetrics.reactionTime <= 400 ? '#52c41a' : '#ff4d4f'} size="small" /></Card></Col>
            <Col span={12}><Card className="dashboard-card" size="small" bodyStyle={{ padding: '12px' }}><Gauge {...gaugeConfig} /></Card></Col>
            <Col span={12}><Card className="dashboard-card" size="small" bodyStyle={{ padding: '12px' }}><Liquid {...liquidConfig} /></Card></Col>
            <Col span={12}><Card className="dashboard-card" size="small"><Statistic title="消耗卡路里" value={realtimeMetrics.caloriesBurned} precision={0} suffix="kcal" valueStyle={{ color: '#722ed1', fontSize: 28 }} /></Card></Col>
            <Col span={12}><Card className="dashboard-card" size="small"><Statistic title="训练帧率" value={demoMode ? 20 : (isTraining ? 30 : 0)} suffix="FPS" valueStyle={{ color: '#1890ff', fontSize: 28 }} /></Card></Col>
          </Row>
          {realtimeMetrics.fatigueLevel > 70 && <Alert message="疲劳度较高" description="建议适当休息，避免运动损伤" type="warning" showIcon icon={<WarningOutlined />} style={{ marginTop: 16 }} />}
          <Card title="实时AI建议" size="small" style={{ marginTop: 16 }}>
            {isActive ? <div style={{ fontSize: 13 }}><p>🎯 <strong>击球姿势</strong>：手腕转动幅度良好</p><p>⚡ <strong>反应速度</strong>：{realtimeMetrics.reactionTime < 400 ? '表现优秀' : '可继续提升'}</p><p>💪 <strong>体能状态</strong>：{realtimeMetrics.fatigueLevel < 50 ? '状态充沛' : '注意休息'}</p></div> : <p style={{ color: '#8c8c8c' }}>开始训练后显示实时AI分析建议</p>}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Training
