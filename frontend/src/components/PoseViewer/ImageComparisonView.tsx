import { Card, Tag, Badge } from 'antd'

interface ImageComparisonViewProps {
  score?: number
}

export const ImageComparisonView: React.FC<ImageComparisonViewProps> = ({
  score = 0,
}) => {
  return (
    <div style={{ display: 'flex', gap: '16px', height: '520px' }}>
      {/* 训练动作 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>训练动作</span>
            <Tag color="blue">实时</Tag>
          </div>
        }
        style={{ flex: 1, height: '100%' }}
        bodyStyle={{
          height: 'calc(100% - 57px)',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f0f0',
        }}
      >
        <img
          src="/training-pose.png"
          alt="训练动作"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </Card>

      {/* 标准动作 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>标准动作</span>
            <Badge
              count={score > 0 ? `${score.toFixed(2)}分` : ''}
              style={{
                backgroundColor: score >= 85 ? '#52c41a' : score >= 70 ? '#faad14' : '#ff4d4f'
              }}
            />
          </div>
        }
        style={{ flex: 1, height: '100%' }}
        bodyStyle={{
          height: 'calc(100% - 57px)',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f0f0',
        }}
      >
        <img
          src="/standard-pose.png"
          alt="标准动作"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </Card>
    </div>
  )
}
