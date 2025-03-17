import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import express from 'express'

import { z } from 'zod'

const app = express()

const server = new McpServer({
  name: 'Weather Service',
  version: '1.0.0',
})

// Add Weather Tool
server.tool('getWeather', { city: z.string() }, async ({ city }) => {
  return {
    content: [
      {
        type: 'text',
        text: `The weather in ${city} is sunny!`,
      },
    ],
  }
})

let transport: SSEServerTransport | undefined = undefined

app.get('/sse', async (req, res) => {
  transport = new SSEServerTransport('/messages', res)
  await server.connect(transport)
})

app.post('/messages', async (req, res) => {
  // Note: to support multiple simultaneous connections, these messages will
  // need to be routed to a specific matching transport. (This logic isn't
  // implemented here, for simplicity.)
  await transport?.handlePostMessage(req, res)
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
