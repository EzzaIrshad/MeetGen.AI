import "server-only"
import { StreamClient} from '@stream-io/node-sdk'

export const streamVideo = new StreamClient(
    process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
    process.env.STREAM_VIDEO_SECRET_KEY!
)

/**
 * Generates a call token for the agent with a backdated iat to handle clock skew.
 * connectOpenAi() doesn't expose iat so we replicate its logic here.
 */
export function generateAgentToken(agentUserId: string, callCid: string): string {
  const iat = Math.floor(Date.now() / 1000) - 60; // backdate 60s for clock skew tolerance
  const exp = Math.floor(Date.now() / 1000) + 60 * 60;
  return streamVideo.generateCallToken({
    user_id: agentUserId,
    call_cids: [callCid],
    iat,
    exp,
  });
}