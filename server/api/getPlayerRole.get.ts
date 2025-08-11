import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { requireAuth } from '../utils/requireAuth'

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
  
  const query = getQuery(event)
  const { roomId, playerId } = query
  
  if (!roomId || !playerId) {
    throw createError({ statusCode: 400, message: 'Missing roomId or playerId' })
  }

  const command = new GetCommand({
    TableName: 'SpyfallRooms',
    Key: { roomId, playerId }
  })

  const { Item } = await client.send(command)
  
  if (!Item) {
    throw createError({ statusCode: 404, message: 'Player not found' })
  }

  if (!Item.gameStarted) {
    throw createError({ statusCode: 400, message: 'Game has not started yet' })
  }

  return {
    role: Item.gameRole,
    location: Item.gameLocation,
    gameEndsAt: Item.gameEndsAt
  }
})