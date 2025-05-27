<script setup lang="ts">
import { ref } from 'vue'

const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true

  try {
    type TokenResponse = { token: string }

const res = await $fetch<TokenResponse>('/api/validatePassword', {
  method: 'POST',
  body: { password: password.value }
})


    localStorage.setItem('access_token', res.token)
    navigateTo('/name')
  } catch {
    error.value = 'Incorrect password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-xs">
      <h1 class="text-xl font-bold text-center mb-4">Enter Game Password</h1>

      <input
        v-model="password"
        type="password"
        placeholder="Enter password"
        class="w-full p-3 border border-gray-300 rounded mb-3"
      >

      <button
        class="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        :disabled="loading"
        @click="submit"
      >
        {{ loading ? 'Checking...' : 'Enter' }}
      </button>

      <p v-if="error" class="text-red-600 mt-3 text-center">{{ error }}</p>
    </div>
  </div>
</template>
