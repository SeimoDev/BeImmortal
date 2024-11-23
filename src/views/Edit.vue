<template>
  <div class="flex flex-col gap-6">
    <!-- 用户信息表单 -->
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">个人信息</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">姓名</span>
            </label>
            <input 
              type="text" 
              v-model="formData.name"
              placeholder="输入你的姓名" 
              class="input input-bordered w-full" 
            />
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">出生日期</span>
            </label>
            <input 
              type="date" 
              v-model="formData.birthDate"
              class="input input-bordered w-full" 
            />
          </div>

          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">钱包地址</span>
            </label>
            <input 
              type="text" 
              :value="walletAddress"
              class="input input-bordered w-full"
              disabled 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 遗嘱内容编辑器 -->
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">遗嘱内容</h2>
        <div class="tabs tabs-boxed">
          <button 
            class="tab" 
            :class="{ 'tab-active': !isPreview }"
            @click="isPreview = false"
          >
            编辑
          </button>
          <button 
            class="tab" 
            :class="{ 'tab-active': isPreview }"
            @click="isPreview = true"
          >
            预览
          </button>
        </div>

        <div v-if="!isPreview" class="form-control mt-4">
          <textarea 
            class="textarea textarea-bordered h-64 font-mono"
            v-model="formData.content"
            placeholder="在这里写下你的遗言..."
          ></textarea>
        </div>
        
        <div v-else class="prose max-w-none bg-base-100 p-4 rounded-lg min-h-[16rem] mt-4" v-html="renderedContent">
        </div>

        <div class="card-actions justify-end mt-4">
          <button 
            class="btn btn-primary"
            @click="saveLegacy"
            :disabled="!isFormValid || isSaving"
          >
            <span v-if="isSaving" class="loading loading-spinner"></span>
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 交易状态提示 -->
    <div v-if="transactionStatus" :class="[
      'alert',
      {
        'alert-info': transactionStatus.type === 'info',
        'alert-success': transactionStatus.type === 'success',
        'alert-error': transactionStatus.type === 'error'
      }
    ]">
      <div class="flex items-center gap-2">
        <span v-if="transactionStatus.type === 'info'" class="loading loading-spinner"></span>
        <svg v-else-if="transactionStatus.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ transactionStatus.message }}</span>
      </div>
      <div v-if="transactionStatus.hash" class="mt-2 text-sm">
        <div class="opacity-70">交易哈希: {{ transactionStatus.hash }}</div>
        <div v-if="transactionStatus.gasUsed" class="opacity-70">Gas消耗: {{ transactionStatus.gasUsed }}</div>
      </div>
      <div v-if="transactionStatus.error" class="mt-2 text-sm bg-base-200 p-2 rounded">
        <div class="font-semibold">错误详情:</div>
        <div class="opacity-70 whitespace-pre-wrap">{{ transactionStatus.error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import createDOMPurify from 'dompurify'
import { web3Service } from '../utils/web3'

const DOMPurify = createDOMPurify(window)

// 配置marked选项
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false,
  headerPrefix: 'heading-',
})

const formData = ref({
  name: '',
  birthDate: '',
  content: ''
})

const walletAddress = ref('')
const isPreview = ref(false)
const isSaving = ref(false)
const transactionStatus = ref(null)

// 表单验证
const isFormValid = computed(() => {
  const nameValid = formData.value.name && formData.value.name.length >= 2
  const birthDateValid = formData.value.birthDate && new Date(formData.value.birthDate) < new Date()
  const contentValid = formData.value.content && formData.value.content.trim().length >= 10
  
  return nameValid && birthDateValid && contentValid
})

// 渲染Markdown内容
const renderedContent = computed(() => {
  const rawHtml = marked(formData.value.content || '')
  return DOMPurify.sanitize(rawHtml)
})

async function saveLegacy() {
  if (isSaving.value) return

  try {
    // 基本验证
    if (!formData.value.name || formData.value.name.length < 2) {
      throw new Error('姓名至少需要2个字符')
    }

    const birthDate = new Date(formData.value.birthDate)
    if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
      throw new Error('请输入有效的出生日期')
    }

    if (!formData.value.content || formData.value.content.trim().length < 10) {
      throw new Error('遗言内容至少需要10个字符')
    }

    isSaving.value = true
    transactionStatus.value = {
      type: 'info',
      message: '正在发送交易...'
    }

    // 转换日期为Unix时间戳（秒）
    const birthTimestamp = Math.floor(birthDate.getTime() / 1000)
    
    // 获取当前钱包地址
    const currentAddress = await web3Service.signer.getAddress()
    
    console.log('Saving legacy with params:', {
      ownerName: formData.value.name,
      ownerAddress: currentAddress,
      birthDate: birthTimestamp,
      lastWords: formData.value.content
    })

    const result = await web3Service.createLegacy(
      formData.value.name,
      currentAddress,
      birthTimestamp,
      formData.value.content
    )

    console.log('Transaction result:', result)

    // 更新交易状态
    transactionStatus.value = {
      type: 'success',
      message: '遗言保存成功！',
      hash: result.transactionHash,
      gasUsed: result.gasUsed,
      event: result.event
    }

    // 清空表单
    formData.value = {
      name: '',
      birthDate: '',
      content: ''
    }
  } catch (error) {
    console.error('保存失败:', error)
    transactionStatus.value = {
      type: 'error',
      message: '保存失败',
      error: error.message || '未知错误'
    }
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  try {
    if (web3Service.signer) {
      walletAddress.value = await web3Service.signer.getAddress()
    }
  } catch (error) {
    console.error('获取钱包地址失败:', error)
    transactionStatus.value = {
      type: 'error',
      message: '钱包连接失败',
      error: error.message
    }
  }
})
</script>

<style>
.prose a {
  @apply text-primary-500 hover:underline;
}

.prose {
  @apply text-neutral-800;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  @apply text-neutral-900 font-display font-semibold;
}

.prose h1 {
  @apply text-3xl mb-6;
}

.prose h2 {
  @apply text-2xl mb-4;
}

.prose h3 {
  @apply text-xl mb-3;
}

.prose p {
  @apply mb-4;
}

.prose ul, .prose ol {
  @apply mb-4 pl-6;
}

.prose li {
  @apply mb-1;
}

.prose blockquote {
  @apply border-l-4 border-primary-200 bg-primary-50 pl-4 py-2 my-4 text-neutral-700 italic;
}

.prose code {
  @apply bg-neutral-100 px-1.5 py-0.5 rounded text-sm font-mono;
}

.prose pre {
  @apply bg-neutral-800 text-neutral-100 p-4 rounded-lg overflow-x-auto mb-4;
}

.prose pre code {
  @apply bg-transparent text-inherit p-0;
}

.prose img {
  @apply rounded-lg shadow-md my-4;
}

.prose hr {
  @apply my-8 border-neutral-200;
}

.prose table {
  @apply w-full border-collapse mb-4;
}

.prose th {
  @apply bg-neutral-100 border border-neutral-300 px-4 py-2 text-left font-semibold;
}

.prose td {
  @apply border border-neutral-300 px-4 py-2;
}
</style>
