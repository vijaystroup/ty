import type { VoiceChannel } from 'discord.js'
import client from '../utils/client'
import prisma from '../utils/prisma'

const VcPoints = {
  cronPattern: '*/5 * * * *', // every 5 minutes
  async execute() {
    // get all vc channels
    const vcChannels = client.channels.cache.filter((channel) => channel.type === 'GUILD_VOICE')

    for (const [_, channel] of vcChannels) {
      // get all members in the channel
      const members = (channel as VoiceChannel).members

      // add points to each member
      try {
        for (const [_, member] of members) {
          await prisma.user.upsert({
            where: { discordId: member.id },
            create: {
              discordId: member.id,
              points: { create: { points: 5 } }
            },
            update: {
              points: {
                update: {
                  points: { increment: 5 }
                }
              }
            }
          })
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
}

export default VcPoints