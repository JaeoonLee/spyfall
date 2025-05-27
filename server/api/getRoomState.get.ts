import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { requireAuth } from '../utils/requireAuth'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export default defineEventHandler(async (event) => {
  requireAuth(event) // ✅ protect the route

  const roomId = getQuery(event).roomId

  if (!roomId) {
    throw createError({ statusCode: 400, message: 'Missing roomId' })
  }

  const command = new QueryCommand({
    TableName: 'SpyfallRooms',
    KeyConditionExpression: 'roomId = :roomId',
    ExpressionAttributeValues: {
      ':roomId': roomId
    }
  })

  const { Items } = await client.send(command)

  return {
    players: Items ?? []
  }
})
