import { useEffect, useState } from 'react'
import {
  Row, Col, Card, Table, Button, Modal, Form, Input,
  Slider, Tag, Space, Spin, message,
} from 'antd'
import {
  DesktopOutlined, PlusOutlined, SettingOutlined, ReloadOutlined,
  
} from '@ant-design/icons'
import { deviceApi } from '../services/api'

interface Device {
  id: string
  device_id: string
  name: string
  type: string
  status: string
  ip_address: string
  firmware_version: string
  config: {
    ball_speed: number
    ball_frequency: number
    spin_type: string
    angle_horizontal: number
    angle_vertical: number
  }
  last_heartbeat: string
}

function Devices() {
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState<Device[]>([])
  const [configModalVisible, setConfigModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [form] = Form.useForm()
  const [addForm] = Form.useForm()

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    setLoading(true)
    try {
      const res: any = await deviceApi.getMyDevices()
      setDevices(res.data || [])
    } catch (err) {
      console.error('获取设备失败', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigSave = async () => {
    if (!selectedDevice) return

    try {
      const values = await form.validateFields()
      await deviceApi.updateConfig(selectedDevice.device_id, values)
      message.success('配置已更新')
      setConfigModalVisible(false)
      fetchDevices()
    } catch (err) {
      message.error('更新失败')
    }
  }

  const handleAddDevice = async () => {
    try {
      const values = await addForm.validateFields()
      await deviceApi.registerDevice({
        device_id: values.device_id,
        name: values.name,
        type: 'orange_pi',
        ip_address: values.ip_address,
      })
      message.success('设备添加成功')
      setAddModalVisible(false)
      addForm.resetFields()
      fetchDevices()
    } catch (err: any) {
      message.error(err.detail || '添加失败')
    }
  }

  const openConfigModal = (device: Device) => {
    setSelectedDevice(device)
    form.setFieldsValue(device.config)
    setConfigModalVisible(true)
  }

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      render: (name: string, record: Device) => (
        <Space>
          <DesktopOutlined />
          {name}
          <Tag>{record.type}</Tag>
        </Space>
      ),
    },
    {
      title: '设备ID',
      dataIndex: 'device_id',
      render: (id: string) => <code>{id}</code>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          online: 'green',
          offline: 'default',
          error: 'red',
          maintenance: 'orange',
        }
        const textMap: Record<string, string> = {
          online: '在线',
          offline: '离线',
          error: '故障',
          maintenance: '维护中',
        }
        return <Tag color={colorMap[status]}>{textMap[status] || status}</Tag>
      },
    },
    {
      title: 'IP地址',
      dataIndex: 'ip_address',
      render: (ip: string) => ip || '-',
    },
    {
      title: '固件版本',
      dataIndex: 'firmware_version',
      render: (v: string) => v || '-',
    },
    {
      title: '操作',
      render: (_: unknown, record: Device) => (
        <Space>
          <Button
            type="link"
            icon={<SettingOutlined />}
            onClick={() => openConfigModal(record)}
          >
            配置
          </Button>
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2 style={{ margin: 0 }}>🖥️ 设备管理</h2>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchDevices}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              添加设备
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 设备统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: '#1890ff' }}>{devices.length}</div>
              <div style={{ color: '#8c8c8c' }}>设备总数</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: '#52c41a' }}>
                {devices.filter((d) => d.status === 'online').length}
              </div>
              <div style={{ color: '#8c8c8c' }}>在线设备</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: '#faad14' }}>
                {devices.filter((d) => d.status === 'offline').length}
              </div>
              <div style={{ color: '#8c8c8c' }}>离线设备</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: '#ff4d4f' }}>
                {devices.filter((d) => d.status === 'error').length}
              </div>
              <div style={{ color: '#8c8c8c' }}>故障设备</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 设备列表 */}
      <Card className="dashboard-card">
        <Table
          columns={columns}
          dataSource={devices}
          rowKey="device_id"
          pagination={false}
        />
      </Card>

      {/* 配置弹窗 */}
      <Modal
        title={`设备配置 - ${selectedDevice?.name}`}
        open={configModalVisible}
        onOk={handleConfigSave}
        onCancel={() => setConfigModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="发球速度" name="ball_speed">
                <Slider min={10} max={100} marks={{ 10: '慢', 50: '中', 100: '快' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="发球频率（秒）" name="ball_frequency">
                <Slider min={0.5} max={5} step={0.5} marks={{ 0.5: '快', 2.5: '中', 5: '慢' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="水平角度" name="angle_horizontal">
                <Slider min={-45} max={45} marks={{ '-45': '左', 0: '中', 45: '右' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="垂直角度" name="angle_vertical">
                <Slider min={-30} max={30} marks={{ '-30': '低', 0: '平', 30: '高' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="旋转类型" name="spin_type">
            <Input placeholder="none / topspin / backspin / sidespin" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加设备弹窗 */}
      <Modal
        title="添加新设备"
        open={addModalVisible}
        onOk={handleAddDevice}
        onCancel={() => setAddModalVisible(false)}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            label="设备ID"
            name="device_id"
            rules={[{ required: true, message: '请输入设备ID' }]}
          >
            <Input placeholder="如：OP-001" />
          </Form.Item>
          <Form.Item
            label="设备名称"
            name="name"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="如：主训练机" />
          </Form.Item>
          <Form.Item label="IP地址" name="ip_address">
            <Input placeholder="192.168.1.100" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Devices
