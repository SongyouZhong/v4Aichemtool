# 第一阶段：构建应用
FROM node:20-alpine AS builder

# 接收构建参数
ARG VERSION=dev
ARG BUILD_TIME

# 设置环境变量，Vite可以在构建时使用
ENV VERSION=$VERSION
ENV BUILD_TIME=$BUILD_TIME

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括开发依赖，用于构建）
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：生产环境
FROM nginx:alpine

# 重新声明构建参数（多阶段构建需要重新声明）
ARG VERSION=dev
ARG BUILD_TIME

# 复制构建的文件到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 添加构建信息到镜像标签
LABEL version="$VERSION"
LABEL build_time="$BUILD_TIME"
LABEL aichemol.version="$VERSION"
LABEL aichemol.build_time="$BUILD_TIME"

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
