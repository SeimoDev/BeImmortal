# BeImmortal - 区块链遗嘱管理平台

BeImmortal 是一个基于区块链技术的去中心化遗嘱管理平台，允许用户创建、管理和存储他们的数字遗产。通过智能合约和区块链技术，确保遗嘱的真实性、不可篡改性和永久保存。

## 主要特性

- 📝 创建和管理数字遗嘱
- 👥 指定见证人机制
- 🔒 区块链保证数据安全
- 💬 留言和评论功能
- 🌐 去中心化存储
- ⚡ 实时状态更新

## 技术栈

- 前端框架：Vue 3 + Vite
- UI 框架：Tailwind CSS + DaisyUI
- 区块链：Ethereum (Goerli测试网)
- Web3 库：ethers.js
- 其他依赖：
  - marked.js (Markdown渲染)
  - DOMPurify (HTML净化)

## 开始使用

### 前提条件

- Node.js (v16+)
- MetaMask 钱包
- Goerli测试网络ETH

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/BeImmortal.git
cd BeImmortal
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 智能合约

合约地址：`0xAEF62B86e5Cd05a6A99fb191AFb0732186A1Bc04` (Goerli测试网)

### 主要功能

- createLegacy：创建新的遗嘱
- claimAsWitness：认领见证人身份
- confirmDeath：确认死亡状态
- updateLegacy：更新遗嘱内容
- addComment：添加评论

## 使用指南

1. 连接MetaMask钱包
2. 确保在Goerli测试网络
3. 创建遗嘱：
   - 填写基本信息
   - 设置见证人地址
   - 编写遗言内容
4. 管理遗嘱：
   - 更新内容
   - 添加评论
   - 查看状态

## 安全考虑

- 客户端钱包连接
- 数据加密存储
- HTML内容净化
- 错误处理机制
- 最小数据暴露

## 贡献指南

欢迎提交 Pull Request 或创建 Issue。

## 开源协议

MIT License

## 联系方式

- 项目主页：[GitHub Repository](https://github.com/seimodev/BeImmortal)
- 问题反馈：[Issue Tracker](https://github.com/seimodev/BeImmortal/issues)
