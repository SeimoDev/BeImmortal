<template>
  <div class="flex flex-col gap-6">
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info shadow-lg mb-4">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>作为见证者，你可以认领并见证他人的遗嘱。认领后，你将有责任在遗嘱所有者去世时确认其死亡。</span>
          </div>
        </div>

        <h2 class="card-title mb-4">认领遗嘱</h2>
        <div class="form-control">
          <label class="label">
            <span class="label-text">遗嘱所有者地址</span>
          </label>
          <div class="join w-full">
            <input 
              type="text" 
              v-model="ownerAddress"
              placeholder="输入遗嘱所有者的钱包地址" 
              class="input input-bordered join-item flex-1" 
            />
            <button 
              class="btn btn-primary join-item"
              @click="claimLegacy"
              :disabled="!ownerAddress"
            >
              认领
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">我认领的遗嘱</h2>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>所有者</th>
                <th>认领时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="legacy in claimedLegacies" :key="legacy.address">
                <td>{{ legacy.name || legacy.address }}</td>
                <td>{{ formatDate(legacy.claimedAt) }}</td>
                <td>
                  <div class="badge" :class="legacy.isPassedAway ? 'badge-error' : 'badge-success'">
                    {{ legacy.isPassedAway ? '已故' : '在世' }}
                  </div>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-error" 
                    @click="confirmDeath(legacy.address)"
                    :disabled="legacy.isPassedAway"
                  >
                    确认死亡
                  </button>
                </td>
              </tr>
              <tr v-if="claimedLegacies.length === 0">
                <td colspan="4" class="text-center text-base-content/50">暂无认领的遗嘱</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { web3Service } from '../utils/web3'

const ownerAddress = ref('')
const claimedLegacies = ref([])

async function claimLegacy() {
  try {
    await web3Service.claimAsWitness(ownerAddress.value)
    alert('认领成功！')
    ownerAddress.value = ''
    await loadClaimedLegacies()
  } catch (error) {
    console.error('认领失败:', error)
    alert('认领失败，请确认地址正确且遗嘱存在')
  }
}

async function confirmDeath(address) {
  if (!confirm('确认要标记该遗嘱所有者已经死亡吗？此操作不可撤销。')) {
    return
  }

  try {
    await web3Service.confirmDeath(address)
    await loadClaimedLegacies()
    alert('已确认死亡')
  } catch (error) {
    console.error('确认死亡失败:', error)
    alert('操作失败，请重试')
  }
}

async function loadClaimedLegacies() {
  // 这里需要从合约中获取当前用户认领的所有遗嘱
  // 暂时使用模拟数据
  claimedLegacies.value = [
    {
      address: '0x1234...5678',
      name: 'John Doe',
      claimedAt: new Date(),
      isPassedAway: false
    }
  ]
}

function formatDate(date) {
  return new Date(date).toLocaleString()
}

onMounted(() => {
  loadClaimedLegacies()
})
</script>
