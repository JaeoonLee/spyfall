<script setup lang="ts">
import GameSettingsVote from '~/components/GameSettingsVote.vue'

const playerName = localStorage.getItem('player_name') ?? 'Unknown'
const players = ref([
  { name: 'Alice', isReady: false },
  { name: 'Bob', isReady: true },
  { name: playerName, isReady: false },
])

const isReady = ref(false)
const vote = ref({ wantsTwoSpies: false, wantsScoreboard: true })

const handleVote = (newVote: typeof vote.value) => {
  vote.value = newVote
}

const markReady = () => {
  isReady.value = true
  const p = players.value.find(p => p.name === playerName)
  if (p) p.isReady = true
}
</script>

<template>
  <div class="p-4 max-w-md mx-auto">
    <h1 class="text-2xl font-semibold text-center mb-4">Game Lobby</h1>

    <!-- Player List -->
    <div class="space-y-3 mb-6">
      <h2 class="text-lg font-medium">Players</h2>
      <ul class="divide-y border rounded p-2">
        <li
          v-for="p in players"
          :key="p.name"
          class="py-1 flex justify-between"
        >
          <span>{{ p.name }}</span>
          <span
            class="text-sm"
            :class="p.isReady ? 'text-green-600' : 'text-gray-400'"
          >
            {{ p.isReady ? 'Ready' : 'Waiting' }}
          </span>
        </li>
      </ul>
    </div>

    <!-- Game Settings Vote -->
    <GameSettingsVote
      :player-count="players.length"
      @update="handleVote"
    />

    <!-- Ready Button -->
    <button
      class="w-full mt-6 bg-blue-600 text-white py-2 rounded"
      @click="markReady"
      :disabled="isReady"
    >
      {{ isReady ? 'Waiting for others...' : "I'm Ready" }}
    </button>
  </div>
</template>
