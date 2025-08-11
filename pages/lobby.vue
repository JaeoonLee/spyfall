<script setup lang="ts">
import GameSettingsVote from '~/components/GameSettingsVote.vue'

const playerName = ref('')
// const players = ref([
//   { name: 'Alice', isReady: false },
//   { name: 'Bob', isReady: true },
//   { name: playerName, isReady: false },
// ])
const isReady = ref(false)
const vote = ref({ wantsTwoSpies: false, wantsScoreboard: true })
const showVotePanel = ref(true)
const roomId = 'test-room-abc' // or load from localStorage
const { players, isLoading } = useRoomState(roomId)


const handleVote = (newVote: typeof vote.value) => {
  vote.value = newVote
  showVotePanel.value = false
}


const markReady = async () => {
  try {
    await useApiFetch('/api/updateReadyStatus', {
      method: 'POST',
      body: { roomId, playerId: playerName.value, isReady: true }
    })
    isReady.value = true
  } catch (error) {
    console.error('Failed to mark ready:', error)
  }
}

const canStartGame = computed(() => {
  return players.value.length >= 3 && players.value.every(p => p.isReady)
})

const startGame = async () => {
  try {
    await useApiFetch('/api/startGame', {
      method: 'POST',
      body: { roomId, gameSettings: vote.value }
    })
    
    // Get player role and navigate to game
    const roleData = await useApiFetch<{ role: string; location: string | null; gameEndsAt: number }>('/api/getPlayerRole', {
      method: 'GET',
      query: { roomId, playerId: playerName.value }
    })
    
    localStorage.setItem('game_role', roleData.role)
    localStorage.setItem('game_location', roleData.location || '')
    localStorage.setItem('game_ends_at', roleData.gameEndsAt.toString())
    
    navigateTo('/game')
  } catch (error) {
    console.error('Failed to start game:', error)
  }
}

onMounted(() => {
  playerName.value = localStorage.getItem('player_name') || 'Unknown'
})
</script>

<template>
  <div class="p-4 max-w-md mx-auto">
    <h1 class="text-2xl font-semibold text-center mb-4">Game Lobby</h1>

    <!-- Player List -->
    <div class="space-y-3 mb-6">
      <h2 class="text-lg font-medium">Players</h2>
      <ul v-if="!isLoading">
        <li v-for="p in players" :key="p.playerId">
          {{ p.name }} - {{ p.isReady ? '✅ Ready' : '🕓 Not Ready' }}
        </li>
      </ul>
    </div>

    <!-- Game Settings Vote -->
    <GameSettingsVote v-if="showVotePanel" :player-count="players.length" @update="handleVote" />

    <!-- Show current vote and toggle if hidden -->
    <div v-else class="mt-4 text-center space-y-2">
      <p class="text-sm text-gray-500">
        You voted:
        <strong>
          {{ vote.wantsTwoSpies ? '2 spies' : '1 spy' }},
          {{ vote.wantsScoreboard ? 'scoreboard on' : 'scoreboard off' }}
        </strong>
      </p>

      <button
class="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
        @click="showVotePanel = true">
        <span>Change vote</span>
        <svg
xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"
          viewBox="0 0 24 24">
          <path
stroke-linecap="round" stroke-linejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1.875 1.875 0 0 0 2.749 1.06c.848-.487 1.933.274 1.746 1.2a1.875 1.875 0 0 0 1.06 2.749c.921.3.921 1.603 0 1.902a1.875 1.875 0 0 0-1.06 2.749c.487.848-.274 1.933-1.2 1.746a1.875 1.875 0 0 0-2.749 1.06c-.3.921-1.603.921-1.902 0a1.875 1.875 0 0 0-2.749-1.06c-.848.487-1.933-.274-1.746-1.2a1.875 1.875 0 0 0-1.06-2.749c-.921-.3-.921-1.603 0-1.902a1.875 1.875 0 0 0 1.06-2.749c-.487-.848.274-1.933 1.2-1.746a1.875 1.875 0 0 0 2.749-1.06z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        </svg>
      </button>
    </div>

    <!-- Ready Button -->
    <button class="w-full mt-6 bg-blue-600 text-white py-2 rounded" :disabled="isReady" @click="markReady">
      {{ isReady ? 'Waiting for others...' : "I'm Ready" }}
    </button>

    <!-- Start Game Button (only visible when all are ready) -->
    <button 
      v-if="canStartGame" 
      class="w-full mt-4 bg-green-600 text-white py-2 rounded font-semibold"
      @click="startGame"
    >
      Start Game!
    </button>
  </div>
</template>
