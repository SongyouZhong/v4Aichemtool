#!/bin/bash

echo "=== AiChemol 前端 Docker 部署脚本 ==="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 进入项目目录
cd /home/songyou/meiyue/v4Aichemtool


echo "📦 使用 docker-compose 构建和启动所有服务..."
cd /home/songyou/meiyue
sudo docker-compose down
sudo docker-compose up --build -d

if [ $? -eq 0 ]; then
    echo "✅ 所有服务启动成功"
    echo ""
    echo "🌐 访问地址："
    echo "   前端应用: http://localhost"
    echo "   后端 API: http://localhost:8000"
    echo "   API 文档: http://localhost:8000/docs"
    echo ""
    echo "📊 容器状态："
    sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "❌ 服务启动失败"
    echo "查看日志："
    sudo docker-compose logs
    exit 1
fi

echo ""
echo "🎉 部署完成！"
