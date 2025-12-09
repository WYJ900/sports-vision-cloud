import { Table, Card, Tag, Progress } from 'antd'
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

export interface ActionMatch {
  sequence: number
  actionName: string
  similarity: number // 0-1 之间的相似度
  distance: number // 相似度距离
  score: number // 分值
  status?: 'excellent' | 'good' | 'warning'
}

interface ActionMatchingTableProps {
  matches: ActionMatch[]
  loading?: boolean
}

const getStatusConfig = (score: number) => {
  if (score >= 85) return { status: 'excellent', color: 'success', icon: <CheckCircleOutlined /> }
  if (score >= 70) return { status: 'good', color: 'processing', icon: <CheckCircleOutlined /> }
  return { status: 'warning', color: 'warning', icon: <WarningOutlined /> }
}

export const ActionMatchingTable: React.FC<ActionMatchingTableProps> = ({
  matches,
  loading = false,
}) => {
  const columns: ColumnsType<ActionMatch> = [
    {
      title: '序号',
      dataIndex: 'sequence',
      key: 'sequence',
      width: 70,
      align: 'center',
      render: (seq: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{seq}</span>
      ),
    },
    {
      title: '动作名称',
      dataIndex: 'actionName',
      key: 'actionName',
      width: 140,
      render: (name: string) => (
        <span style={{ fontWeight: 500 }}>{name}</span>
      ),
    },
    {
      title: '相似度距离(d)',
      dataIndex: 'distance',
      key: 'distance',
      width: 140,
      align: 'center',
      render: (distance: number) => (
        <span style={{ fontFamily: 'monospace', color: '#595959' }}>
          {distance.toFixed(2)}
        </span>
      ),
    },
    {
      title: '分值(s)',
      dataIndex: 'score',
      key: 'score',
      width: 110,
      align: 'center',
      render: (score: number) => {
        const config = getStatusConfig(score)
        return (
          <Tag color={config.color} icon={config.icon}>
            {score.toFixed(2)}
          </Tag>
        )
      },
    },
    {
      title: '匹配度',
      key: 'progress',
      width: 150,
      render: (_: any, record: ActionMatch) => {
        const percent = record.score
        const config = getStatusConfig(percent)
        return (
          <Progress
            percent={percent}
            size="small"
            status={config.status as any}
            strokeColor={
              percent >= 85 ? '#52c41a' :
              percent >= 70 ? '#1890ff' : '#faad14'
            }
            format={(p) => `${p?.toFixed(2)}%`}
          />
        )
      },
    },
  ]

  return (
    <Card
      title="实时动作分析匹配表"
      size="small"
      style={{ marginTop: 16 }}
      bodyStyle={{ padding: '12px' }}
    >
      <Table
        columns={columns}
        dataSource={matches}
        loading={loading}
        pagination={false}
        size="small"
        rowKey="sequence"
        scroll={{ y: 450, x: 'max-content' }}
        style={{ fontSize: 13 }}
      />
      {matches.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c', textAlign: 'center' }}>
          基于 DTW 算法的姿态匹配与评价 · 共{matches.length}条数据，相似度越低分值越高
        </div>
      )}
    </Card>
  )
}
