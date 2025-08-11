import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
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
  requireAuth(event) // ✅ protect the route
  
  const body = await readBody(event)

  const { roomId, playerId, name } = body

  if (!roomId || !playerId || !name) {
    throw createError({ statusCode: 400, message: 'Missing fields' })
  }

  const command = new PutCommand({
    TableName: 'SpyfallRooms',
    Item: {
      roomId,
      playerId,
      name,
      isReady: false,
      vote: null,
      updatedAt: Date.now()
    }
  })

  await client.send(command)

  return { success: true }
})
