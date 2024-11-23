<template>
  <div class="grid grid-cols-2 gap-8">
    <!-- Left Panel -->
    <div class="card bg-base-200 p-6">
      <h2 class="card-title mb-6">遗嘱信息</h2>
      
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
          <span class="label-text">死亡日期</span>
        </label>
        <div class="input input-bordered w-full py-3">
          {{ legacy.isPassedAway ? formatDate(legacy.deathDate) : '尚未确认' }}
        </div>
      </div>

      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">见证者</span>
        </label>
        <div class="space-y-2">
          <div 
            v-for="witness in witnesses" 
            :key="witness.address"
            class="flex items-center gap-2 p-2 bg-base-100 rounded-lg"
          >
            <div class="flex-1">
              <div class="font-mono text-sm">{{ witness.address }}</div>
              <div class="text-xs opacity-70">
                {{ witness.hasConfirmed ? '已确认死亡' : '未确认' }}
              </div>
            </div>
            <div 
              class="badge" 
              :class="witness.hasConfirmed ? 'badge-success' : 'badge-warning'"
            >
              {{ witness.hasConfirmed ? '已确认' : '待确认' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="card bg-base-200 p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="card-title">遗言内容</h2>
        <div class="badge badge-lg" :class="legacy.isPassedAway ? 'badge-success' : 'badge-warning'">
          {{ legacy.isPassedAway ? '已解密' : '未解密' }}
        </div>
      </div>
      
      <div v-if="legacy.isPassedAway" class="prose max-w-none">
        <div v-html="renderedContent"></div>
      </div>
      <div v-else class="flex items-center justify-center h-[200px] text-lg opacity-50">
        需要所有见证者确认死亡后才能查看遗言内容
      </div>

      <!-- Comments Section -->
      <div class="mt-8" v-if="legacy.isPassedAway">
        <h3 class="text-lg font-semibold mb-4">评论</h3>
        
        <div class="space-y-4 mb-6">
          <div v-for="comment in comments" :key="comment" class="bg-base-100 p-4 rounded-lg">
            {{ comment }}
          </div>
          
          <div v-if="comments.length === 0" class="text-center py-4 opacity-50">
            暂无评论
          </div>
        </div>

        <div class="form-control">
          <div class="flex gap-2">
            <input 
              type="text" 
              v-model="newComment"
              placeholder="写下你的评论" 
              class="input input-bordered flex-1"
              @keyup.enter="handleAddComment"
            />
            <button 
              @click="handleAddComment" 
              class="btn btn-primary"
              :disabled="commenting"
            >
              <span v-if="!commenting">发表</span>
              <span v-else class="loading loading-spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import { web3Service } from '../utils/web3'
import { EncryptionService } from '../utils/encryption'

const route = useRoute()
const newComment = ref('')
const commenting = ref(false)

const legacy = ref({
  ownerName: '',
  ownerAddress: '',
  birthDate: 0,
  deathDate: 0,
  lastWords: '',
  isPassedAway: false
})

const witnesses = ref([])
const comments = ref([])

onMounted(async () => {
  const address = route.query.address
  if (!address) return
  
  await loadLegacyData(address)
})

async function loadLegacyData(address) {
  try {
    const [legacyData, isPassedAway, comments] = await Promise.all([
      web3Service.getLegacy(address),
      web3Service.isPassedAway(address),
      web3Service.getComments(address)
    ])
    
    legacy.value = {
      ownerName: legacyData[0],
      ownerAddress: legacyData[1],
      birthDate: Number(legacyData[2]),
      lastWords: legacyData[3],
      isPassedAway,
      deathDate: Date.now() // 这里需要从合约中获取实际的死亡确认时间
    }

    // 这里需要实现获取见证者列表的合约方法
    witnesses.value = [
      {
        address: legacyData[4],
        hasConfirmed: isPassedAway
      }
    ]

    comments.value = comments
  } catch (error) {
    console.error('加载遗嘱数据失败:', error)
    alert('加载遗嘱数据失败，请重试')
  }
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString()
}

const renderedContent = computed(() => {
  if (!legacy.value.lastWords) return ''
  try {
    const encryptedChunks = JSON.parse(legacy.value.lastWords)
    // 这里需要实现解密逻辑
    return marked(legacy.value.lastWords)
  } catch {
    return marked(legacy.value.lastWords)
  }
})

async function handleAddComment() {
  if (!newComment.value.trim()) return
  
  try {
    commenting.value = true
    await web3Service.addComment(legacy.value.ownerAddress, newComment.value)
    comments.value.push(newComment.value)
    newComment.value = ''
  } catch (error) {
    console.error('发表评论失败:', error)
    alert('发表评论失败，请重试')
  } finally {
    commenting.value = false
  }
}
</script>
