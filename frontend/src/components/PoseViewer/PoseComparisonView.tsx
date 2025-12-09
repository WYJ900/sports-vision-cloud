import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Text } from '@react-three/drei'
import { Card, Tag, Badge } from 'antd'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'

// YOLOv11-Pose 17关键点骨架连接
const POSE_CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 4],
  [5, 6], [5, 11], [6, 12], [11, 12],
  [5, 7], [7, 9],
  [6, 8], [8, 10],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
]

interface PoseSkeletonProps {
  keypoints: number[][] | null
  color?: string
  title?: string
}

function PoseSkeleton({ keypoints, color = '#4ecdc4', title }: PoseSkeletonProps) {
  if (!keypoints || keypoints.length < 17) return null

  const points = keypoints.map(([x, y, z]) =>
    new THREE.Vector3((x - 0.5) * 2, -(y - 0.5) * 2, z * 2)
  )

  const getColor = (idx: number) => {
    if (idx <= 4) return '#ff6b6b'
    if (idx <= 10) return color
    return '#45b7d1'
  }

  return (
    <group>
      {points.map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial
            color={getColor(i)}
            emissive={getColor(i)}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      {POSE_CONNECTIONS.map(([start, end], i) => {
        if (start >= points.length || end >= points.length) return null
        return (
          <Line
            key={i}
            points={[points[start], points[end]]}
            color="#ffffff"
            lineWidth={2}
          />
        )
      })}
      {title && (
        <Text
          position={[0, 1.1, 0]}
          fontSize={0.08}
          color={color}
          anchorX="center"
        >
          {title}
        </Text>
      )}
    </group>
  )
}

function Floor() {
  return (
    <group>
      <gridHelper
        args={[3, 15, '#333', '#222']}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -1, 0]}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

interface CameraControllerProps {
  resetTrigger?: number
}

function CameraController({ resetTrigger }: CameraControllerProps) {
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    if (resetTrigger && controlsRef.current) {
      controlsRef.current.reset()
    }
  }, [resetTrigger])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      maxDistance={5}
      minDistance={1}
    />
  )
}

interface PoseComparisonViewProps {
  trainingPose: number[][] | null
  standardPose: number[][] | null
  score?: number
  resetTrigger?: number
}

export const PoseComparisonView: React.FC<PoseComparisonViewProps> = ({
  trainingPose,
  standardPose,
  score = 0,
  resetTrigger,
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
        bodyStyle={{ height: 'calc(100% - 57px)', padding: 0, background: '#0d1117' }}
      >
        <Canvas camera={{ position: [0, 0, 2.5], fov: 55 }} shadows>
          <color attach="background" args={['#0d1117']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={0.8} castShadow />
          <pointLight position={[-5, 5, -5]} intensity={0.4} />
          <PoseSkeleton
            keypoints={trainingPose}
            color="#4ecdc4"
            title=""
          />
          <Floor />
          <CameraController resetTrigger={resetTrigger} />
        </Canvas>
      </Card>

      {/* 标准动作 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>标准动作</span>
            <Badge
              count={score > 0 ? `${score.toFixed(0)}分` : ''}
              style={{ backgroundColor: score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#ff4d4f' }}
            />
          </div>
        }
        style={{ flex: 1, height: '100%' }}
        bodyStyle={{ height: 'calc(100% - 57px)', padding: 0, background: '#0d1117' }}
      >
        <Canvas camera={{ position: [0, 0, 2.5], fov: 55 }} shadows>
          <color attach="background" args={['#0d1117']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={0.8} castShadow />
          <pointLight position={[-5, 5, -5]} intensity={0.4} />
          <PoseSkeleton
            keypoints={standardPose}
            color="#52c41a"
            title=""
          />
          <Floor />
          <CameraController resetTrigger={resetTrigger} />
        </Canvas>
      </Card>
    </div>
  )
}
