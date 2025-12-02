import { useState } from 'react'
import {
  Card, Form, Input, Button, Switch, Select, Divider, Row, Col,
  Avatar, Upload, message, Tabs, InputNumber,
} from 'antd'
import {
  UserOutlined, LockOutlined, BellOutlined, SettingOutlined,
  UploadOutlined, SaveOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'

function Settings() {
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  const handleProfileSave = async () => {
    try {
      await profileForm.validateFields()
      setLoading(true)
      // TODO: 调用API保存
      await new Promise((r) => setTimeout(r, 1000))
      message.success('个人信息已更新')
    } catch {
      // 验证失败
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      const values = await passwordForm.validateFields()
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次密码输入不一致')
        return
      }
      setLoading(true)
      // TODO: 调用API修改密码
      await new Promise((r) => setTimeout(r, 1000))
      message.success('密码已修改')
      passwordForm.resetFields()
    } catch {
      // 验证失败
    } finally {
      setLoading(false)
    }
  }

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          个人信息
        </span>
      ),
      children: (
        <Card>
          <Row gutter={48}>
            <Col xs={24} md={8} style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={120} icon={<UserOutlined />} />
              <div style={{ marginTop: 16 }}>
                <Upload showUploadList={false}>
                  <Button icon={<UploadOutlined />}>更换头像</Button>
                </Upload>
              </div>
            </Col>
            <Col xs={24} md={16}>
              <Form
                form={profileForm}
                layout="vertical"
                initialValues={{
                  username: user?.username,
                  email: user?.email,
                  nickname: user?.nickname,
                }}
              >
                <Form.Item label="用户名" name="username">
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  label="邮箱"
                  name="email"
                  rules={[{ type: 'email', message: '邮箱格式不正确' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="昵称" name="nickname">
                  <Input placeholder="设置您的昵称" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleProfileSave}
                    loading={loading}
                  >
                    保存修改
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined />
          安全设置
        </span>
      ),
      children: (
        <Card title="修改密码">
          <Form form={passwordForm} layout="vertical" style={{ maxWidth: 400 }}>
            <Form.Item
              label="当前密码"
              name="currentPassword"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              rules={[{ required: true, message: '请确认新密码' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handlePasswordChange}
                loading={loading}
              >
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'notification',
      label: (
        <span>
          <BellOutlined />
          通知设置
        </span>
      ),
      children: (
        <Card>
          <Form layout="vertical">
            <Form.Item label="训练提醒" valuePropName="checked">
              <Switch defaultChecked />
              <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
                每日训练计划提醒
              </span>
            </Form.Item>
            <Form.Item label="成就通知" valuePropName="checked">
              <Switch defaultChecked />
              <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
                达成新成就时通知
              </span>
            </Form.Item>
            <Form.Item label="设备状态" valuePropName="checked">
              <Switch defaultChecked />
              <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
                设备上线/离线通知
              </span>
            </Form.Item>
            <Form.Item label="疲劳预警" valuePropName="checked">
              <Switch defaultChecked />
              <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
                训练中疲劳度过高时提醒
              </span>
            </Form.Item>
            <Divider />
            <Form.Item label="邮件通知" valuePropName="checked">
              <Switch />
              <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
                发送周报和月度总结到邮箱
              </span>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'training',
      label: (
        <span>
          <SettingOutlined />
          训练偏好
        </span>
      ),
      children: (
        <Card>
          <Form layout="vertical" style={{ maxWidth: 500 }}>
            <Form.Item label="默认训练模式">
              <Select
                defaultValue="standard"
                options={[
                  { value: 'standard', label: '标准模式' },
                  { value: 'intensive', label: '强化模式' },
                  { value: 'recovery', label: '恢复模式' },
                ]}
              />
            </Form.Item>
            <Form.Item label="默认训练时长（分钟）">
              <InputNumber min={10} max={120} defaultValue={30} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="疲劳度预警阈值">
              <InputNumber
                min={50}
                max={90}
                defaultValue={70}
                formatter={(v) => `${v}%`}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item label="目标击球率">
              <InputNumber
                min={50}
                max={100}
                defaultValue={75}
                formatter={(v) => `${v}%`}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" icon={<SaveOutlined />}>
                保存偏好
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>⚙️ 系统设置</h2>
      <Tabs items={tabItems} tabPosition="left" />
    </div>
  )
}

export default Settings
