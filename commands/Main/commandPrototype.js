const fetch = require('node-fetch');
const ms = require('ms');
const {
    MessageEmbed
} = require('discord.js')
const nbx = require('noblox.js');
module.exports = {
    name: "prototype",
    description: "Prototype",
    run: async (client, message, args) => {
        const config = require('../../config.json')

        if (!message.member.hasPermission('KICK_MEMBERS')) return;

        var botMessage = new MessageEmbed()
        let data;
        //Possible Inputs
        const USER = message.mentions.users.first() || args[0]
        if(!USER) return message.channel.send("Please state the user")

        const time = args[1];
        if (!time) return message.channel.send("Please state the time")

        //ID Parser for rover API
        async function roverGet(user) {
            var user = await fetch(`https://verify.eryn.io/api/user/${user}`)
            user = await user.json()
            return user
        }

        //ID Parser for plain text
        async function nobloxGet(user) {
            return await nbx.getIdFromUsername(user)
        }

        if (message.mentions.users.first()) {
            data = await roverGet(USER.id)

            if (data.status == 'ok') {
                let currentRank = await nbx.getRankInGroup(config.GROUPID, data.robloxId)
                if (currentRank == 0) return message.channel.send("This user is not in group")
                if (currentRank >= 250) return message.channel.send("I can't suspend that user, as it has a higher rank than me")
                if (currentRank == 2) return message.channel.send("This user is already suspended")

                let currentRankName = await nbx.getRankNameInGroup(config.GROUPID, data.robloxId)

                botMessage.setColor('8a8986')
                botMessage.setTitle("User Suspended Successfully")
                botMessage.setDescription(`${USER} has been suspended`)
                botMessage.addField(`__**Previous Rank:**__`, `${currentRankName}`, true)

                botMessage.setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${data.robloxId}&width=420&height=420&format=png`)

                try {
                    await nbx.setRank(config.GROUPID, data.robloxId, 2)
                    await botMessage.addField("__**For:**__", `${ms(ms(time))}`, true)
                    await message.channel.send(botMessage)
                } catch (error) {
                    await message.channel.send("An error has occured:\n ```diff\n- " + error + "\n```")
                }

                const revert = new MessageEmbed()
                    .setTitle("E-Class Sentence Terminated")
                    .setDescription(`${USER} has finished its E Class Sentence, its previous rank has been reestablished`)
                    .setColor('8a8986')

                setTimeout(async function () {
                    try {
                        await nbx.setRank(config.GROUPID, data.robloxId, currentRank)
                        await message.channel.send(revert)
                    } catch (error) {
                        await message.channel.send("An error has occured while reverting changes:\n ```diff\n- " + error + "\n```")
                    }
                }, ms(time))

            } else {
                botMessage.setColor('de0202')

                switch (data.errorCode) {
                    case 404:
                        botMessage.setDescription("This discord account is not linked to any roblox account. Please redirect them [here](https://verify.eryn.io/)\nContact O5-6 if the error persists")
                        botMessage.setTitle("Error Code 404")
                        break;

                    case 429:
                        botMessage.setDescription("Too many requests are being performed, please retry again after **" + data.retryAfterSeconds + "** seconds. \nContact O5-6 if the error persists.")
                        botMessage.setTitle("Error Code 429")
                        break;

                    default:
                        botMessage.setDescription("There was an error while fetching the account.\nPlease contact O5-6 if the error persists.")
                        botMessage.setTitle("Error Code " + data.errorCode)
                }
                message.channel.send(botMessage)
            }
        }

        if (args[0]) {
            data = await nobloxGet(USER)
            const currentrank = await nbx.getRankInGroup(config.GROUPID, data)
            if (currentrank == 0) return message.channel.send("This user is not in group")
            if (currentrank >= 250) return message.channel.send("I can't suspend that user, as it has a higher rank than me")
            if (currentrank == 2) return message.channel.send("This user is already suspended")

            botMessage.setColor('8a8986')
            botMessage.setTitle("User Suspended Successfully")
            botMessage.setDescription(`${USER} has been suspended`)
            botMessage.addField(`__**Previous Rank:**__`, `${await nbx.getRankNameInGroup(config.GROUPID, data)}`, true)

            botMessage.setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${data}&width=420&height=420&format=png`)

            try {
                await nbx.setRank(config.GROUPID, data, 2)
                await botMessage.addField("__**For:**__", `${ms(ms(time))}`, true)
                await message.channel.send(botMessage)
            } catch (error) {
                await message.channel.send("An error has occured:\n ```diff\n- " + error + "\n```")
            }

            const revert = new MessageEmbed()
                    .setTitle("E-Class Sentence Terminated")
                    .setDescription(`${USER} has finished its E Class Sentence, its previous rank has been reestablished`)
                    .setColor('8a8986')

            setTimeout(async function () {
                try {
                    await nbx.setRank(config.GROUPID, data, currentrank)
                    await message.channel.send(revert)
                } catch (error) {
                    await message.channel.send("An error has occured while reverting changes:\n ```diff\n- " + error + "\n```")
                }
            }, ms(time))
        }
    }
}