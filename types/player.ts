export interface Player {
    roomId: string
    playerId: string
    name: string
    isReady: boolean
    vote: any | null // or make this more specific later
    updatedAt: number
  }