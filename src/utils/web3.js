import { ethers } from 'ethers'

// 合约地址
const contractAddress = '0xAEF62B86e5Cd05a6A99fb191AFb0732186A1Bc04'

// 合约ABI
const contractABI = [{"inputs":[],"name":"InvalidAddress","type":"error"},{"inputs":[],"name":"LegacyAlreadyExists","type":"error"},{"inputs":[],"name":"LegacyNotFound","type":"error"},{"inputs":[],"name":"Unauthorized","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"ownerAddress","type":"address"},{"indexed":false,"internalType":"string","name":"comment","type":"string"}],"name":"CommentAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"ownerAddress","type":"address"}],"name":"DeathConfirmed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"ownerAddress","type":"address"},{"indexed":false,"internalType":"string","name":"ownerName","type":"string"}],"name":"LegacyCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"ownerAddress","type":"address"},{"indexed":false,"internalType":"string","name":"newLastWords","type":"string"}],"name":"LegacyUpdated","type":"event"},{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"},{"internalType":"string","name":"comment","type":"string"}],"name":"addComment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"}],"name":"confirmDeath","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"ownerName","type":"string"},{"internalType":"address","name":"ownerAddress","type":"address"},{"internalType":"uint256","name":"birthDate","type":"uint256"},{"internalType":"string","name":"lastWords","type":"string"},{"internalType":"address","name":"witnessAddress","type":"address"}],"name":"createLegacy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deleteLegacy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"}],"name":"getBirthDate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"}],"name":"getComments","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"}],"name":"getLastWords","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"}],"name":"getLegacy","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"string","name":"","type":"string"},{"internalType":"address","name":"","type":"address"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"}],"name":"getLifeStatus","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"}],"name":"getOwnerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"}],"name":"getOwnerName","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"}],"name":"getWitnessAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"legacies","outputs":[{"internalType":"string","name":"ownerName","type":"string"},{"internalType":"address","name":"ownerAddress","type":"address"},{"internalType":"uint256","name":"birthDate","type":"uint256"},{"internalType":"string","name":"lastWords","type":"string"},{"internalType":"address","name":"witnessAddress","type":"address"},{"internalType":"bool","name":"isPassedAway","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"ownerAddress","type":"address"},{"internalType":"string","name":"newLastWords","type":"string"}],"name":"updateLegacy","outputs":[],"stateMutability":"nonpayable","type":"function"}]

class Web3Service {
  constructor() {
    this.provider = null
    this.signer = null
    this.contract = null
    this.isConnected = false
  }

  // 处理合约错误
  handleError(error, action) {
    console.error(`${action}失败:`, error)

    // 处理自定义错误
    if (error.data) {
      const customErrors = {
        'InvalidAddress': '无效的地址',
        'LegacyAlreadyExists': '遗嘱已存在',
        'LegacyNotFound': '遗嘱不存在',
        'Unauthorized': '未授权的操作'
      }

      for (const [errorName, errorMessage] of Object.entries(customErrors)) {
        if (error.data.includes(errorName)) {
          throw new Error(errorMessage)
        }
      }
    }

    // 处理常见错误
    if (error.code === 4001) {
      throw new Error('用户拒绝了交易')
    } else if (error.code === -32603) {
      throw new Error('交易执行失败，请检查输入参数')
    }

    throw error
  }

  async connect() {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('请安装MetaMask钱包')
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      
      this.contract = new ethers.Contract(
        contractAddress,
        contractABI,
        this.signer
      )

      this.isConnected = true

      // 监听账户变化
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          this.signer = await this.provider.getSigner()
        } else {
          this.isConnected = false
        }
      })

      return true
    } catch (error) {
      this.isConnected = false
      throw this.handleError(error, '连接钱包')
    }
  }

  async createLegacy(ownerName, ownerAddress, birthDate, lastWords) {
    if (!this.isConnected) await this.connect()
    
    try {
      // 验证参数
      if (!ownerName || typeof ownerName !== 'string' || ownerName.length < 2) {
        throw new Error('无效的姓名')
      }

      if (!ethers.isAddress(ownerAddress)) {
        throw new Error('无效的钱包地址')
      }

      if (!Number.isInteger(birthDate) || birthDate <= 0) {
        throw new Error('无效的出生日期')
      }

      if (!lastWords || typeof lastWords !== 'string' || lastWords.trim().length < 10) {
        throw new Error('无效的遗言内容')
      }

      // 设置一个临时的见证人地址（后续可以更新）
      const witnessAddress = ethers.ZeroAddress
      
      console.log('Creating legacy with params:', {
        ownerName,
        ownerAddress,
        birthDate: BigInt(birthDate),
        lastWords,
        witnessAddress
      })

      // 发送交易
      const tx = await this.contract.createLegacy(
        ownerName,
        ownerAddress,
        BigInt(birthDate),
        lastWords,
        witnessAddress,
        {
          gasLimit: 500000 // 设置一个合理的 gas 限制
        }
      )

      console.log('Transaction sent:', tx.hash)

      // 等待交易被确认
      const receipt = await tx.wait()
      console.log('Transaction receipt:', receipt)

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      }

    } catch (error) {
      throw this.handleError(error, '创建遗嘱')
    }
  }

  async getLegacy(ownerAddress) {
    if (!this.isConnected) await this.connect()
    try {
      return await this.contract.getLegacy(ownerAddress)
    } catch (error) {
      throw this.handleError(error, '获取遗嘱')
    }
  }

  async getComments(ownerAddress) {
    if (!this.isConnected) await this.connect()
    try {
      return await this.contract.getComments(ownerAddress)
    } catch (error) {
      throw this.handleError(error, '获取评论')
    }
  }

  async isPassedAway(ownerAddress) {
    if (!this.isConnected) await this.connect()
    try {
      return await this.contract.isPassedAway(ownerAddress)
    } catch (error) {
      throw this.handleError(error, '获取生命状态')
    }
  }

  async updateLegacy(ownerAddress, newLastWords) {
    if (!this.isConnected) await this.connect()
    try {
      const tx = await this.contract.updateLegacy(ownerAddress, newLastWords)
      const receipt = await tx.wait()
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      }
    } catch (error) {
      throw this.handleError(error, '更新遗嘱')
    }
  }

  async addComment(ownerAddress, comment) {
    if (!this.isConnected) await this.connect()
    try {
      const tx = await this.contract.addComment(ownerAddress, comment)
      const receipt = await tx.wait()
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      }
    } catch (error) {
      throw this.handleError(error, '添加评论')
    }
  }

  async confirmDeath(ownerAddress) {
    if (!this.isConnected) await this.connect()
    try {
      const tx = await this.contract.confirmDeath(ownerAddress)
      const receipt = await tx.wait()
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      }
    } catch (error) {
      throw this.handleError(error, '确认死亡')
    }
  }
}

export const web3Service = new Web3Service()
