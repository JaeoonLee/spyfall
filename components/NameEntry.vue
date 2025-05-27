<script setup lang="ts">
const name = ref('')
const saved = ref(false)

const emit = defineEmits(['saved'])

function submit() {
  if (name.value.trim()) {
    localStorage.setItem('player_name', name.value.trim())
    saved.value = true
    emit('saved')
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-xs">
      <h1 class="text-xl font-bold text-center mb-4">What's your name?</h1>

      <input
        v-model="name"
        placeholder="Enter your name"
        class="w-full p-3 border border-gray-300 rounded mb-3"
      />

      <button
        class="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
        @click="submit"
      >
        Join Game
      </button>

      <p v-if="saved" class="text-green-600 mt-3 text-center">Name saved!</p>
    </div>
  </div>
</template>
