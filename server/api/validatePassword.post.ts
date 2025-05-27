import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  if (body.password !== config.ACCESS_PASSWORD) {
    throw createError({ statusCode: 401, message: 'Invalid password' })
  }

  const token = jwt.sign({ accessGranted: true }, config.JWT_SECRET, {
    expiresIn: '12h'
  })

  return { token }
})
