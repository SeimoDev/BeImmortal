import { ref, onMounted } from 'vue'
import { web3Service } from '../utils/web3'

export function useWeb3() {
  const address = ref('')
  const isConnecting = ref(false)
  const error = ref(null)

  const connect = async () => {
    try {
      isConnecting.value = true
      error.value = null
      
      const connected = await web3Service.connect()
      if (connected) {
        address.value = await web3Service.signer.getAddress()
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to connect wallet:', err)
    } finally {
      isConnecting.value = false
    }
  }

  const disconnect = async () => {
    try {
      address.value = ''
      // 可以添加其他断开连接的逻辑
    } catch (err) {
      error.value = err.message
      console.error('Failed to disconnect wallet:', err)
    }
  }

  const checkConnection = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          await connect()
        }
      }
    } catch (err) {
      console.error('Failed to check wallet connection:', err)
    }
  }

  onMounted(() => {
    checkConnection()

    // 监听账户变化
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          await connect()
        } else {
          await disconnect()
        }
      })

      // 监听链变化
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
  })

  return {
    address,
    isConnecting,
    error,
    connect,
    disconnect
  }
}
