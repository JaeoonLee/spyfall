import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
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
  
  const body = await readBody(event)
  const { roomId, playerId, isReady } = body
  
  if (!roomId || !playerId || typeof isReady !== 'boolean') {
    throw createError({ statusCode: 400, message: 'Missing or invalid fields' })
  }

  const command = new UpdateCommand({
    TableName: 'SpyfallRooms',
    Key: { roomId, playerId },
    UpdateExpression: 'SET isReady = :isReady, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':isReady': isReady,
      ':updatedAt': Date.now()
    }
  })

  await client.send(command)

  return { success: true }
})