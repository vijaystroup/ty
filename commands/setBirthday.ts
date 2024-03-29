import type { CommandInteraction, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import moment from 'moment-timezone'
import prisma from '../utils/prisma'

async function insertBirthday(discordId: string, date: Date) {
  try {
    const user = await prisma.user.findUnique({
      where: { discordId },
      include: { birthday: true }
    })

    if (!user) await prisma.user.create({
      data: {
        discordId,
        birthday: {
          create: {
            birthday: date
          }
        },
      },
    })
    else {
      if (!user.birthday) await prisma.user.update({
        where: { discordId },
        data: {
          birthday: {
            create: {
              birthday: date
            }
          }
        },
      })
      else {
        const monthDay = moment(user.birthday.birthday).format('MM/DD')
        throw new Error(`Birthday already set to ${monthDay}.`)
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}

const SetBirthday = {
  builder: new SlashCommandBuilder()
    .setName('setbirthday')
    .setDescription('Set Your Birthday.')
    .addNumberOption((option) =>
      option.setName('month').setDescription('month').setRequired(true)
    )
    .addNumberOption((option) =>
      option.setName('day').setDescription('day').setRequired(true)
    ),
  async execute(interaction: CommandInteraction, message: Message) {
    const month = interaction.options.getNumber('month')
    const day = interaction.options.getNumber('day')
    const discordId = interaction.member.user.id

    const dateFormatted = moment(`${month}/${day}`, 'MM/DD').format('MM/DD')
    const date = new Date(dateFormatted)

    if (dateFormatted === 'Invalid date') {
      await interaction.reply({
        content: 'Invalid input date. Please try again.',
        ephemeral: true,
      })
      return
    }

    try {
      await insertBirthday(discordId, date)
      await interaction.reply({
        content: `Birthday set to ${dateFormatted}`,
        ephemeral: true,
      })
    } catch (error) {
      await interaction.reply({
        content: error.message,
        ephemeral: true,
      })
    }
  }
}

export default SetBirthday
