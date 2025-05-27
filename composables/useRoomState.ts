// import { useIntervalFn } from '@vueuse/core'

// export function useRoomState(roomId: string) {
//   const players = ref<any[]>([])
//   const isLoading = ref(false)
//   const error = ref<Error | null>(null)

//   const fetchRoom = async () => {
//     try {
//       isLoading.value = true
//       const data = await useApiFetch<{ players: any[] }>('/api/getRoomState', {
//         method: 'GET',
//         query: { roomId }
//       })
//       players.value = data.players
//     } catch (err) {
//       error.value = err as Error
//     } finally {
//       isLoading.value = false
//     }
//   }

//   // Auto-poll every 2 seconds
//   useIntervalFn(fetchRoom, 2000, { immediate: true })

//   return { players, isLoading, error }
// }

import { useIntervalFn } from '@vueuse/core'
import { useApiFetch } from '~/composables/useApiFetch'
import type { Player } from '~/types/player'

export function useRoomState(roomId: string) {
  const players = ref<Player[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const fetchRoom = async () => {
    try {
      isLoading.value = true
      const data = await useApiFetch<{ players: Player[] }>('/api/getRoomState', {
        method: 'GET',
        query: { roomId }
      })
      players.value = data.players
    } catch (err) {
      error.value = err as Error
    } finally {
      isLoading.value = false
    }
  }

  useIntervalFn(fetchRoom, 2000, { immediate: true })

  return { players, isLoading, error }
}
