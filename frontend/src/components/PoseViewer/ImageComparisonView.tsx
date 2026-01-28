import { Card, Tag, Badge } from 'antd'
import { useRef, useEffect } from 'react'

// YOLOv11-Pose 17关键点骨架连接
const POSE_CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 4],
  [5, 6], [5, 11], [6, 12], [11, 12],
  [5, 7], [7, 9],
  [6, 8], [8, 10],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
]

interface ImageComparisonViewProps {
  score?: number
  videoFrame?: string  // Base64编码的实时视频帧
  poseData?: number[][] | null  // 骨骼点数据
}

export const ImageComparisonView: React.FC<ImageComparisonViewProps> = ({
  score = 0,
  videoFrame = '',
  poseData = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !poseData || poseData.length < 17) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawSkeleton = () => {
      const rect = img.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 绘制骨骼连接线
      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 3
      POSE_CONNECTIONS.forEach(([start, end]) => {
        if (start < poseData.length && end < poseData.length) {
          const [x1, y1] = poseData[start]
          const [x2, y2] = poseData[end]
          const conf1 = poseData[start][2] || 0.5
          const conf2 = poseData[end][2] || 0.5
          if (conf1 < 0.3 || conf2 < 0.3) return
          ctx.beginPath()
          ctx.moveTo(x1 * canvas.width, y1 * canvas.height)
          ctx.lineTo(x2 * canvas.width, y2 * canvas.height)
          ctx.stroke()
        }
      })

      // 绘制关键点
      poseData.forEach((kp, idx) => {
        const [x, y] = kp
        const confidence = kp[2] || 0.5
        if (confidence < 0.3) return

        ctx.beginPath()
        ctx.arc(x * canvas.width, y * canvas.height, 6, 0, Math.PI * 2)
        ctx.fillStyle = idx <= 4 ? '#ff6b6b' : idx <= 10 ? '#4ecdc4' : '#45b7d1'
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    if (img.complete) {
      drawSkeleton()
    } else {
      img.onload = drawSkeleton
    }
  }, [videoFrame, poseData])
  return (
    <div style={{ display: 'flex', gap: '16px', height: '520px' }}>
      {/* 训练动作 - 实时视频流 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>训练动作</span>
            <Tag color={videoFrame ? 'green' : 'blue'}>{videoFrame ? '实时视频流' : '实时'}</Tag>
          </div>
        }
        style={{ flex: 1, height: '100%' }}
        bodyStyle={{
          height: 'calc(100% - 57px)',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d1117',
        }}
      >
        {videoFrame ? (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              ref={imgRef}
              src={videoFrame}
              alt="实时训练画面"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        ) : (
          <div style={{ color: '#8c8c8c', textAlign: 'center' }}>
            <p>等待视频流...</p>
            <p style={{ fontSize: 12 }}>香橙派设备连接后将显示实时画面</p>
          </div>
        )}
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
