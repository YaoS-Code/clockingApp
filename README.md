# ClockingApp

ClockingApp是一个基于Web的员工打卡和时间管理系统，专为MMC Wellness设计。该应用程序允许员工记录工作时间、查看历史记录，并提交修改请求。管理员可以查看所有员工的记录、生成报告，以及批准或拒绝修改请求。

## 功能特点

### 员工功能
- 打卡上下班
- 查看个人打卡记录
- 提交时间修改请求
- 查看修改请求状态

### 管理员功能
- 查看所有员工的打卡记录
- 按时间段生成报告
- 管理用户账户
- 处理员工的修改请求

## 技术栈

### 前端
- React.js
- Material-UI
- Redux Toolkit
- Axios

### 后端
- Node.js
- Express.js
- MySQL
- JWT认证

### 部署
- Docker & Docker Compose
- Nginx

## 快速开始

### 使用Docker部署

1. 克隆仓库
```bash
git clone https://git.borui.ca/MMCWellness/clockingApp.git
cd clockingApp
```

2. 启动应用
```bash
docker-compose up -d
```

3. 访问应用
- 前端: http://localhost:3001
- 后端API: http://localhost:13000/api

### 自定义配置

如果需要自定义配置，可以使用personalize-docker.sh脚本：
```bash
chmod +x personalize-docker.sh
./personalize-docker.sh
```

## 项目结构

```
clockingApp/
├── client/                 # 前端React应用
├── server/                 # 后端Node.js应用
├── mysql-init/             # MySQL初始化脚本
├── docker-compose.yml      # Docker Compose配置
├── Dockerfile.client       # 前端Docker配置
├── Dockerfile.server       # 后端Docker配置
├── clockingapp-docker.sh   # Docker管理脚本
└── DOCKER_README.md        # Docker详细说明
```

## 管理脚本

项目包含一个Docker管理脚本，提供常用操作：

```bash
./clockingapp-docker.sh start    # 启动容器
./clockingapp-docker.sh stop     # 停止容器
./clockingapp-docker.sh restart  # 重启容器
./clockingapp-docker.sh logs     # 查看日志
./clockingapp-docker.sh backup   # 备份数据库
./clockingapp-docker.sh restore  # 恢复数据库
```

## 许可证

© 2024 MMC Wellness. 保留所有权利。
