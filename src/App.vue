<template>
  <div class="min-h-screen bg-neutral-50" data-theme="beimmortal">
    <nav class="navbar bg-white shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex-1">
          <router-link to="/" class="text-2xl font-display font-bold text-primary-600">
            BeImmortal
          </router-link>
        </div>
        <div class="flex-none">
          <button class="btn btn-primary" @click="connectWallet" v-if="!isConnected" :disabled="isConnecting">
            <span v-if="isConnecting" class="loading loading-spinner loading-sm"></span>
            <span v-else>连接钱包</span>
          </button>
          <div class="dropdown dropdown-end" v-else>
            <label tabindex="0" class="btn btn-outline">
              {{ shortAddress }}
            </label>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52">
              <li><router-link to="/create" class="text-neutral-700">创建遗嘱</router-link></li>
              <li><router-link to="/manage" class="text-neutral-700">管理遗嘱</router-link></li>
              <li><a @click="disconnectWallet" class="text-error">断开连接</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="bg-white border-t border-neutral-200">
      <div class="container mx-auto px-4 py-8">
        <div class="text-center text-neutral-500">
          <p>&copy; {{ new Date().getFullYear() }} BeImmortal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWeb3 } from './composables/useWeb3'

const { connect, disconnect, address, isConnecting, error } = useWeb3()

const isConnected = computed(() => !!address.value)
const shortAddress = computed(() => {
  if (!address.value) return ''
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
})

const connectWallet = async () => {
  try {
    await connect()
  } catch (error) {
    console.error('Failed to connect wallet:', error)
  }
}

const disconnectWallet = async () => {
  try {
    await disconnect()
  } catch (error) {
    console.error('Failed to disconnect wallet:', error)
  }
}
</script>

<style>
@import './assets/main.css';
</style>
