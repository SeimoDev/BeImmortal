<template>
  <div class="hero min-h-[calc(100vh-4rem)]">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold mb-8">BeImmortal</h1>
        <p class="text-xl mb-8">
          让你的思想永存于区块链之上，将你的遗言传递给后人。
          在这里，你可以创建一份永不消逝的数字遗嘱。
        </p>
        <div class="form-control w-full max-w-md mx-auto mb-8">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="输入钱包地址查询遗嘱" 
            class="input input-bordered w-full"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="flex gap-4 justify-center">
          <router-link to="/edit" class="btn btn-primary">创建遗嘱</router-link>
          <router-link to="/witness" class="btn btn-secondary">成为见证者</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

function handleSearch() {
  if (searchQuery.value) {
    router.push({
      name: 'Query',
      query: { address: searchQuery.value }
    })
  }
}
</script>
