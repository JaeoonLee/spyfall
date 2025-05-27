<script setup lang="ts">
import NameEntry from '~/components/NameEntry.vue'

onMounted(() => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    navigateTo('/') // Block access if no token
  }

  if (localStorage.getItem('player_name')) {
    navigateTo('/lobby')
  }
})

function onNameSaved() {
  navigateTo('/lobby')
}
</script>

<template>
  <NameEntry @saved="onNameSaved" />
</template>
