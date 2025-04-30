# Deploying the Saino Chat Cloudflare Worker

This guide explains how to deploy the WebSocket chat server to Cloudflare Workers to enable real-time cross-device communication.

## Prerequisites

1. A Cloudflare account (sign up at [cloudflare.com](https://cloudflare.com) if you don't have one)
2. Wrangler CLI installed (`npm install -g wrangler`)
3. Authenticated with Cloudflare (`wrangler login`)

## Steps to Deploy

1. Create a new directory for your worker:
   \`\`\`bash
   mkdir saino-chat-worker
   cd saino-chat-worker
   \`\`\`

2. Initialize a new worker project:
   \`\`\`bash
   wrangler init
   \`\`\`

3. Replace the contents of `src/index.js` with the code from `cloudflare-worker.js`

4. Configure your `wrangler.toml` file:
   ```toml
   name = "saino-chat"
   main = "src/index.js"
   compatibility_date = "2023-12-01"

   [triggers]
   crons = []
   \`\`\`

5. Deploy the worker:
   \`\`\`bash
   wrangler publish
   \`\`\`

6. After deployment, Cloudflare will provide you with a URL for your worker (e.g., `saino-chat.yourdomain.workers.dev`)

7. Update the WebSocket URL in your frontend code:
   - Open `lib/websocket-chat-service.ts`
   - Update the `getWebSocketUrl()` method to use your worker's URL:
     \`\`\`typescript
     private getWebSocketUrl(): string {
       const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
       return `${protocol}//saino-chat.yourdomain.workers.dev`
     }
     \`\`\`

## Testing Locally

1. Run the worker locally:
   \`\`\`bash
   wrangler dev
   \`\`\`

2. In your Next.js app, make sure the WebSocket service is configured to connect to the local worker:
   \`\`\`typescript
   // For local development
   if (process.env.NODE_ENV === "development") {
     return `${protocol}//localhost:8787`
   }
   \`\`\`

## Rocket.Chat Alternative

If you prefer to use Rocket.Chat instead of a custom Cloudflare Worker:

1. Set up a Rocket.Chat server (self-hosted or cloud)
2. Create a dedicated channel for each contract address
3. Use the Rocket.Chat REST API to integrate with your application
4. Update the chat service to connect to Rocket.Chat instead of WebSockets

## Notes

- Cloudflare Workers have a CPU time limit of 10ms in the free tier. For production use, consider upgrading to a paid plan.
- WebSocket connections in Cloudflare Workers are limited to 30 seconds in the free tier. The code includes reconnection logic to handle this limitation.
- For production use, consider implementing authentication and rate limiting to prevent abuse.
\`\`\`

Let's also update the chat room component to better handle the WebSocket connection:
