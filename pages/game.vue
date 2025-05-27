<script setup lang="ts">
const router = useRouter()

const role = ref('')
const location = ref('')
const gameEndsAt = ref<Date | null>(null)
const remaining = ref(0)

onMounted(() => {
  role.value = localStorage.getItem('game_role') || ''
  location.value = localStorage.getItem('game_location') || ''
  const ends = localStorage.getItem('game_ends_at')

  if (!role.value || !location.value || !ends) {
    router.push('/lobby') // force back if no data
    return
  }

  gameEndsAt.value = new Date(ends)

  updateRemaining()
  setInterval(updateRemaining, 1000)
})

function updateRemaining() {
  if (!gameEndsAt.value) return
  const now = new Date()
  remaining.value = Math.max(0, Math.floor((+gameEndsAt.value - +now) / 1000))
}

function endGame() {
  localStorage.removeItem('game_role')
  localStorage.removeItem('game_location')
  localStorage.removeItem('game_ends_at')
  router.push('/lobby')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-6">
    <h1 class="text-3xl font-bold">Your Role</h1>

    <div
      class="text-2xl font-semibold p-4 border rounded shadow-md bg-white"
      :class="role === 'Spy' ? 'text-red-600' : 'text-green-700'"
    >
      {{ role }}
    </div>

    <div v-if="role !== 'Spy'" class="text-xl">
      <span class="text-gray-500">Location:</span>
      <div class="mt-1 font-semibold text-lg">{{ location }}</div>
    </div>

    <div class="mt-6">
      <h2 class="text-gray-600 text-sm">Time Remaining</h2>
      <div class="text-3xl font-mono">
        {{ Math.floor(remaining / 60) }}:{{ (remaining % 60).toString().padStart(2, '0') }}
      </div>
    </div>

    <!-- End Game Button -->
    <button
      class="mt-8 bg-red-600 text-white py-2 px-6 rounded"
      @click="endGame"
    >
      End Game & Return to Lobby
    </button>
  </div>
</template>
