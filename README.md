# 🏸 运动训练AI可视化云平台

基于AI的专业运动训练数据可视化平台，支持实时姿态分析、训练指标监测、个性化训练建议。

## 📋 功能特性

### 人体姿态分析
- YOLOv11-Pose 17关键点实时采集
- 3D骨架可视化渲染
- 运动姿态识别（准确率>95%）
- 击球回传率统计

### AI训练辅助
- YOLOv11视觉识别 + 姿态分类
- 自动分析用户弱点
- 动态调整发球参数
- 个性化训练计划
- 疲劳度监测与保护

### 数据可视化
- 实时训练仪表盘
- 历史数据趋势分析
- 能力雷达图
- AI分析报告

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Ant Design 5 + Three.js |
| 后端 | Python FastAPI + WebSocket |
| 数据库 | MongoDB（业务数据）+ InfluxDB（时序数据）|
| 缓存 | Redis |
| 部署 | Docker + Kubernetes |

## 📁 项目结构

```
sports-vision-cloud/
├── frontend/                # React前端应用
│   ├── src/
│   │   ├── components/     # UI组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   └── stores/         # 状态管理
│   ├── Dockerfile
│   └── package.json
├── backend/                 # FastAPI后端服务
│   ├── app/
│   │   ├── api/            # API路由
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   └── core/           # 核心配置
│   ├── Dockerfile
│   └── requirements.txt
├── k8s/                     # Kubernetes配置
│   ├── deployments/
│   ├── services/
│   └── configmaps/
└── docker-compose.yml       # 本地开发环境
```

## 🚀 快速启动

### 环境要求

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- MongoDB 7.0
- InfluxDB 2.7
- Redis 7

### 本地开发

**1. 启动数据库服务**

```bash
docker-compose up -d mongodb influxdb redis
```

**2. 启动后端**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # 编辑配置
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**3. 启动前端**

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

### Docker部署

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f
```

### Kubernetes部署

```bash
# 创建命名空间
kubectl apply -f k8s/namespace.yaml

# 部署配置
kubectl apply -f k8s/configmaps/

# 部署服务
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/

# 配置Ingress
kubectl apply -f k8s/ingress.yaml
```

## 📡 API文档

启动后端后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 核心API

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/v1/auth/login` | POST | 用户登录 |
| `/api/v1/auth/register` | POST | 用户注册 |
| `/api/v1/dashboard/stats` | GET | 仪表盘统计 |
| `/api/v1/training/sessions/start` | POST | 开始训练 |
| `/api/v1/training/sessions/{id}/end` | POST | 结束训练 |
| `/api/v1/training/stats` | GET | 训练统计 |
| `/api/v1/training/analysis/{id}` | GET | AI分析结果 |
| `/api/v1/devices/` | GET | 设备列表 |
| `/ws/user/{user_id}` | WebSocket | 实时数据流 |

## 🔌 设备接入

### Orange Pi数据上报

```python
import websockets
import json

async def report_data():
    async with websockets.connect("ws://server/ws/device/DEVICE_ID") as ws:
        # 上报姿态数据
        await ws.send(json.dumps({
            "type": "pose_data",
            "user_id": "USER_ID",
            "data": {
                "keypoints": [[x, y, z, visibility], ...],  # 17个关键点
                "confidence": 0.95
            }
        }))

        # 上报实时指标
        await ws.send(json.dumps({
            "type": "metrics",
            "user_id": "USER_ID",
            "data": {
                "hit_rate": 75.5,
                "reaction_time": 380,
                "accuracy": 82.3,
                "fatigue_level": 45
            }
        }))
```

## 📊 数据模型

### 训练会话
```json
{
  "user_id": "string",
  "device_id": "string",
  "status": "active|completed",
  "start_time": "datetime",
  "end_time": "datetime",
  "metrics": {
    "hit_rate": 75.5,
    "reaction_time": 380,
    "accuracy": 82.3,
    "fatigue_level": 45,
    "calories_burned": 150
  }
}
```

### 设备配置
```json
{
  "ball_speed": 50,
  "ball_frequency": 2.0,
  "spin_type": "topspin",
  "angle_horizontal": 0,
  "angle_vertical": 10
}
```

## 🔒 安全配置

生产环境部署前务必修改：

1. `SECRET_KEY` - JWT签名密钥
2. `INFLUX_TOKEN` - InfluxDB访问令牌
3. `MONGO_USER/PASSWORD` - MongoDB认证
4. CORS配置 - 限制允许的域名

## 📈 监控指标

平台自动采集以下指标：
- 用户训练频次与时长
- 设备在线状态
- API响应时间
- WebSocket连接数

## 🤝 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'Add xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 创建Pull Request

## 📄 许可证

MIT License
