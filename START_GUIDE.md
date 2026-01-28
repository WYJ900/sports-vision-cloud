# 完整启动指南

## 🎯 当前状态

✅ **前端已启动**：http://localhost:3001 （React + TypeScript + Vite）
❌ **后端未启动**：Python FastAPI 后端需要单独启动

## 📦 系统要求

### 前端
- Node.js 16.x+
- npm 7.x+

### 后端
- Python 3.8+
- pip

## 🚀 完整启动流程

### 步骤1：启动后端（Python FastAPI）

```bash
# 进入后端目录
cd backend

# 创建Python虚拟环境（首次）
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖（首次或更新后）
pip install -r requirements.txt

# 启动后端服务
python -m uvicorn app.main:app --reload --port 3000
```

后端将运行在：**http://localhost:3000**

### 步骤2：启动前端（已完成✅）

前端已经在运行了！
- 地址：**http://localhost:3001**
- 状态：✅ 正常运行

### 步骤3：访问应用

1. 打开浏览器访问：**http://localhost:3001**

2. 使用演示账户登录（密码任意）：
   - `demo1` - 业余入门
   - `demo2` - 业余高手
   - `demo3` - 职业选手

3. 点击左侧"🏸 实时训练"菜单

4. 点击"演示模式"按钮

5. 切换到"双画面对比"标签查看新功能

## 🔍 检查服务状态

### 检查后端
```bash
curl http://localhost:3000/health
```

### 检查前端
```bash
curl http://localhost:3001
```

## ⚠️ 常见问题

### 问题1：Python虚拟环境激活失败
**Windows PowerShell可能需要修改执行策略：**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 问题2：端口被占用
**后端端口3000被占用：**
```bash
# 使用其他端口
python -m uvicorn app.main:app --reload --port 8000
```

**前端会自动选择可用端口**，查看终端输出的实际地址。

### 问题3：后端启动失败
```bash
# 重新安装依赖
cd backend
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

### 问题4：CORS跨域错误
确保后端和前端都在运行，并且后端配置了正确的CORS设置。

## 📝 开发模式特点

### 前端（Vite开发服务器）
- ✅ 热更新（Hot Module Replacement）
- ✅ 快速构建
- ✅ 自动刷新
- ✅ 开发时自动打开浏览器

### 后端（FastAPI + uvicorn）
- ✅ 自动重载（--reload）
- ✅ 交互式API文档：http://localhost:3000/docs
- ✅ 备用文档：http://localhost:3000/redoc
- ✅ WebSocket支持

## 🎨 新功能位置

新增的姿态对比功能位于：

**导航路径**：实时训练 → 演示模式 → 双画面对比

**功能特性**：
- 左右双画面3D姿态对比
- 实时动作匹配评分
- 10种羽毛球标准动作分析表
- 基于DTW算法的相似度计算
- 差异化评分系统（根据用户等级）

## 📊 端口使用说明

| 服务 | 默认端口 | 当前端口 | 状态 |
|------|---------|---------|------|
| 后端API | 3000 | 待启动 | ❌ |
| 前端Dev | 5173 | 3001 | ✅ |
| MongoDB | 27017 | - | 可选 |
| WebSocket | 3000 | - | 随后端 |

## 🐳 Docker部署（可选）

如果想使用Docker：

```bash
# 在项目根目录
docker-compose up -d
```

这会同时启动前端、后端和MongoDB。

## 📚 相关文档

- `POSE_COMPARISON_FEATURE.md` - 新功能详细说明
- `QUICK_START.md` - 快速体验指南
- `TROUBLESHOOTING.md` - 故障排除
- `README.md` - 项目说明

## 🎯 下一步

1. ✅ 前端已启动 - http://localhost:3001
2. **❗需要启动后端** - 运行上述Python命令
3. 访问前端页面，登录并测试新功能

---

**提示**：目前前端已经可以在演示模式下完整体验新功能，即使后端未启动也不影响姿态对比功能的展示！
