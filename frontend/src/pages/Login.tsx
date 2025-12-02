import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Tabs, Space, Divider, Row, Col, Typography, Checkbox } from 'antd'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  SafetyOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import { authApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'

const { Title, Text, Paragraph } = Typography

interface LoginForm {
  username: string
  password: string
  remember?: boolean
}

interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

// 动态背景粒子效果
const ParticleBackground = () => {
  const [particles] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }))
  )

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            animation: `float ${p.duration}s infinite ease-in-out`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .login-card {
          animation: slideIn 0.6s ease-out;
        }
        .demo-btn:hover {
          animation: pulse 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

// 特性卡片
const features = [
  { icon: <EyeOutlined style={{ fontSize: 28, color: '#1890ff' }} />, title: 'AI姿态识别', desc: 'MediaPipe 33关键点实时追踪' },
  { icon: <ThunderboltOutlined style={{ fontSize: 28, color: '#faad14' }} />, title: '实时反馈', desc: '毫秒级响应数据分析' },
  { icon: <SafetyOutlined style={{ fontSize: 28, color: '#52c41a' }} />, title: '智能建议', desc: '基于AI的个性化训练方案' },
]

function Login() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const [showFeatures, setShowFeatures] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const timer = setTimeout(() => setShowFeatures(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = async (values: LoginForm) => {
    setLoading(true)
    try {
      const res: any = await authApi.login(values.username, values.password)
      if (res.code === 0) {
        setAuth(res.data.access_token, { id: '', username: values.username, email: '' })
        message.success('登录成功')
        navigate('/dashboard')
      }
    } catch (err: any) {
      message.error(err.detail || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values: RegisterForm) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次密码输入不一致')
      return
    }

    setLoading(true)
    try {
      const res: any = await authApi.register({
        username: values.username,
        email: values.email,
        password: values.password,
      })
      if (res.code === 0) {
        message.success('注册成功，请登录')
        setActiveTab('login')
      }
    } catch (err: any) {
      message.error(err.detail || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  // 演示登录
  const handleDemoLogin = () => {
    setAuth('demo_token', { id: 'demo', username: 'demo', email: 'demo@example.com' })
    message.success('演示模式登录成功')
    navigate('/dashboard')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <ParticleBackground />

      <Row gutter={48} align="middle" style={{ maxWidth: 1100, width: '100%', padding: '20px', position: 'relative', zIndex: 1 }}>
        {/* 左侧介绍区域 */}
        <Col xs={24} lg={12} style={{ marginBottom: 24 }}>
          <div style={{ color: '#fff', opacity: showFeatures ? 1 : 0, transition: 'opacity 0.8s ease' }}>
            <Space align="center" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 48, lineHeight: 1 }}>🏸</div>
              <div>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>Sports Vision Cloud</Title>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>AI驱动的运动训练云平台</Text>
              </div>
            </Space>

            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 32, lineHeight: 1.8 }}>
              基于计算机视觉与深度学习的智能运动训练系统，通过MediaPipe姿态识别与YOLOv5目标检测，
              为运动员提供专业级的实时动作分析、个性化训练建议与数据可视化服务。
            </Paragraph>

            <Row gutter={[16, 16]}>
              {features.map((f, idx) => (
                <Col span={24} key={idx}>
                  <div
                    className="feature-card"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 12,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      transition: 'all 0.3s ease',
                      opacity: showFeatures ? 1 : 0,
                      transform: showFeatures ? 'translateX(0)' : 'translateX(-20px)',
                      transitionDelay: `${idx * 0.1 + 0.3}s`,
                    }}
                  >
                    <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {f.icon}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>{f.title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{f.desc}</div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Orange Pi 5', 'MediaPipe', 'YOLOv5', 'React', 'FastAPI', 'Three.js'].map((tech) => (
                <span key={tech} style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 20, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </Col>

        {/* 右侧登录卡片 */}
        <Col xs={24} lg={12}>
          <Card
            className="login-card"
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              borderRadius: 16,
              border: 'none',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
            }}
            bordered={false}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div>
              <Title level={3} style={{ margin: 0 }}>欢迎回来</Title>
              <Text type="secondary">登录以开始您的智能训练之旅</Text>
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              centered
              items={[
                {
                  key: 'login',
                  label: <span><UserOutlined /> 登录</span>,
                  children: (
                    <Form onFinish={handleLogin} size="large" initialValues={{ remember: true }}>
                      <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                        <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="用户名 / 邮箱" style={{ borderRadius: 8 }} />
                      </Form.Item>
                      <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                        <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="密码" style={{ borderRadius: 8 }} />
                      </Form.Item>
                      <Form.Item>
                        <Row justify="space-between" align="middle">
                          <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>记住我</Checkbox>
                          </Form.Item>
                          <a style={{ color: '#1890ff' }}>忘记密码?</a>
                        </Row>
                      </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          loading={loading}
                          style={{ height: 44, borderRadius: 8, fontSize: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                        >
                          登录
                        </Button>
                      </Form.Item>
                    </Form>
                  ),
                },
                {
                  key: 'register',
                  label: <span><RocketOutlined /> 注册</span>,
                  children: (
                    <Form onFinish={handleRegister} size="large">
                      <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }, { min: 3, message: '用户名至少3个字符' }]}>
                        <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="用户名" style={{ borderRadius: 8 }} />
                      </Form.Item>
                      <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}>
                        <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="邮箱" style={{ borderRadius: 8 }} />
                      </Form.Item>
                      <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6个字符' }]}>
                        <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="密码" style={{ borderRadius: 8 }} />
                      </Form.Item>
                      <Form.Item name="confirmPassword" rules={[{ required: true, message: '请确认密码' }]}>
                        <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="确认密码" style={{ borderRadius: 8 }} />
                      </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          loading={loading}
                          style={{ height: 44, borderRadius: 8, fontSize: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                        >
                          注册
                        </Button>
                      </Form.Item>
                    </Form>
                  ),
                },
              ]}
            />

            <Divider style={{ margin: '16px 0' }}><Text type="secondary" style={{ fontSize: 12 }}>或者</Text></Divider>

            <Button
              className="demo-btn"
              block
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={handleDemoLogin}
              style={{
                height: 44,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: 500,
              }}
            >
              演示模式体验
            </Button>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <Space split={<Divider type="vertical" />} style={{ fontSize: 12, color: '#8c8c8c' }}>
                <span><CheckCircleOutlined style={{ color: '#52c41a' }} /> 免费使用</span>
                <span><CheckCircleOutlined style={{ color: '#52c41a' }} /> 数据安全</span>
                <span><CheckCircleOutlined style={{ color: '#52c41a' }} /> 专业分析</span>
              </Space>
            </div>
          </Card>

          <div style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
            © 2024 Sports Vision Cloud · 基于 AI 的智能运动训练平台
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Login
