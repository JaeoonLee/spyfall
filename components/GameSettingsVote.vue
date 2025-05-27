<script setup lang="ts">
const props = defineProps<{
  playerCount: number
}>()

const emit = defineEmits(['update'])

const wantsScoreboard = ref(true)
const wantsTwoSpies = ref(false)

const showTwoSpiesOption = computed(() => props.playerCount >= 7)

watch([wantsScoreboard, wantsTwoSpies], () => {
  emit('update', {
    wantsScoreboard: wantsScoreboard.value,
    wantsTwoSpies: wantsTwoSpies.value
  })
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <label class="block text-lg font-medium mb-2">Enable Scoreboard?</label>
      <div class="flex gap-4">
        <button
          class="flex-1 py-2 rounded border"
          :class="wantsScoreboard ? 'bg-green-600 text-white' : 'bg-white border-gray-300'"
          @click="wantsScoreboard = true"
        >
          Yes
        </button>
        <button
          class="flex-1 py-2 rounded border"
          :class="!wantsScoreboard ? 'bg-red-600 text-white' : 'bg-white border-gray-300'"
          @click="wantsScoreboard = false"
        >
          No
        </button>
      </div>
    </div>

    <div v-if="showTwoSpiesOption">
      <label class="block text-lg font-medium mb-2">Allow 2 Spies?</label>
      <div class="flex gap-4">
        <button
          class="flex-1 py-2 rounded border"
          :class="wantsTwoSpies ? 'bg-green-600 text-white' : 'bg-white border-gray-300'"
          @click="wantsTwoSpies = true"
        >
          Yes
        </button>
        <button
          class="flex-1 py-2 rounded border"
          :class="!wantsTwoSpies ? 'bg-red-600 text-white' : 'bg-white border-gray-300'"
          @click="wantsTwoSpies = false"
        >
          No
        </button>
      </div>
    </div>
  </div>
</template>
