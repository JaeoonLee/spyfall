import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { requireAuth } from '../utils/requireAuth'
import { spyfallLocations } from '~/data/locations'

const config = useRuntimeConfig()
const client = new DynamoDBClient({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID!,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY!
  }
})

export default defineEventHandler(async (event) => {
  requireAuth(event)
  
  const body = await readBody(event)
  const { roomId, gameSettings } = body
  
  if (!roomId) {
    throw createError({ statusCode: 400, message: 'Missing roomId' })
  }

  // Get all players in the room
  const queryCommand = new QueryCommand({
    TableName: 'SpyfallRooms',
    KeyConditionExpression: 'roomId = :roomId',
    ExpressionAttributeValues: {
      ':roomId': roomId
    }
  })

  const { Items = [] } = await client.send(queryCommand)
  
  if (Items.length < 3) {
    throw createError({ statusCode: 400, message: 'Need at least 3 players to start' })
  }

  // Check if all players are ready
  const allReady = Items.every(player => player.isReady)
  if (!allReady) {
    throw createError({ statusCode: 400, message: 'All players must be ready' })
  }

  // Randomly select location
  const location = spyfallLocations[Math.floor(Math.random() * spyfallLocations.length)]
  
  // Determine number of spies
  const playerCount = Items.length
  const spyCount = gameSettings?.wantsTwoSpies && playerCount >= 7 ? 2 : 1
  
  // Randomly assign spy roles
  const shuffledPlayers = [...Items].sort(() => Math.random() - 0.5)
  const spies = shuffledPlayers.slice(0, spyCount)
  const spyIds = new Set(spies.map(spy => spy.playerId))
  
  // Game duration: 8 minutes
  const gameEndsAt = new Date(Date.now() + 8 * 60 * 1000)
  
  // Update each player with their role
  for (const player of Items) {
    const isSpy = spyIds.has(player.playerId)
    
    const updateCommand = new UpdateCommand({
      TableName: 'SpyfallRooms',
      Key: { roomId, playerId: player.playerId },
      UpdateExpression: 'SET gameRole = :role, gameLocation = :location, gameEndsAt = :endsAt, gameStarted = :started',
      ExpressionAttributeValues: {
        ':role': isSpy ? 'Spy' : 'Citizen',
        ':location': isSpy ? null : location,
        ':endsAt': gameEndsAt.getTime(),
        ':started': true
      }
    })
    
    await client.send(updateCommand)
  }

  return { 
    success: true, 
    location: location,
    gameEndsAt: gameEndsAt.getTime(),
    spyCount 
  }
})