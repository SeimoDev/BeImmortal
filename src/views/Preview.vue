<template>
  <div class="grid grid-cols-2 gap-8">
    <!-- Left Panel -->
    <div class="card bg-base-200 p-6">
      <h2 class="card-title mb-6">个人信息</h2>
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">姓名</span>
        </label>
        <div class="input input-bordered w-full py-3">{{ legacy.ownerName }}</div>
      </div>

      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">钱包地址</span>
        </label>
        <div class="input input-bordered w-full py-3">{{ legacy.ownerAddress }}</div>
      </div>

      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">出生日期</span>
        </label>
        <div class="input input-bordered w-full py-3">{{ formatDate(legacy.birthDate) }}</div>
      </div>

      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">见证者钱包地址</span>
        </label>
        <div class="input input-bordered w-full py-3">{{ legacy.witnessAddress }}</div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="card bg-base-200 p-6">
      <h2 class="card-title mb-6">遗言内容</h2>
      <div class="prose max-w-none h-[500px] overflow-y-auto p-4 bg-base-100 rounded-lg">
        <div v-html="renderedContent"></div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button 
      @click="handlePublish" 
      class="fixed bottom-8 right-8 btn btn-primary btn-circle btn-lg shadow-lg"
      :disabled="publishing"
    >
      <svg v-if="!publishing" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <span v-else class="loading loading-spinner loading-lg"></span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import { web3Service } from '../utils/web3'

const router = useRouter()
const publishing = ref(false)

const legacy = ref({
  ownerName: '',
  ownerAddress: '',
  birthDate: '',
  lastWords: '',
  witnessAddress: ''
})

onMounted(async () => {
  try {
    const currentAddress = await web3Service.signer.getAddress()
    const legacyData = await web3Service.getLegacy(currentAddress)
    
    legacy.value = {
      ownerName: legacyData[0],
      ownerAddress: legacyData[1],
      birthDate: Number(legacyData[2]),
      lastWords: legacyData[3],
      witnessAddress: legacyData[4]
    }
  } catch (error) {
    console.error('获取遗嘱数据失败:', error)
    alert('获取遗嘱数据失败，请重试')
    router.push('/edit')
  }
})

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString()
}

const renderedContent = computed(() => {
  return marked(legacy.value.lastWords)
})

async function handlePublish() {
  try {
    publishing.value = true
    await web3Service.updateLegacy(legacy.value.ownerAddress, legacy.value.lastWords)
    alert('发布成功！')
    router.push('/')
  } catch (error) {
    console.error('发布失败:', error)
    alert('发布失败，请重试')
  } finally {
    publishing.value = false
  }
}
</script>
