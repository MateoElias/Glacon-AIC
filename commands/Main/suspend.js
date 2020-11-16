const fetch = require('node-fetch');
const nbx = require('noblox.js');
const ms = require('ms');
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: "suspend",
    description: "Suspends a user for a period of time",
    run: async(client, message, args) => {
        const config = require('../../config.json')

        if (!message.member.hasPermission('KICK_MEMBERS')) return;

        const person = message.mentions.users.first()
        if(!person) return message.channel.send("Please mention the user to suspend")

        const botMessage = new MessageEmbed()

        const time = args[1];
        if(!time) return message.channel.send("Please state the time")

        var data = await fetch(`https://verify.eryn.io/api/user/${person.id}`)
        data = await data.json()

        if(data.status == 'ok'){
            let currentRank = await nbx.getRankInGroup(config.GROUPID, data.robloxId)
            if(currentRank == 0) return message.channel.send("This user is not in group")
            if(currentRank >= 250) return message.channel.send("I can't suspend that user, as it has a higher rank than me")
            if(currentRank == 2) return message.channel.send("This user is already suspended")

            let currentRankName = await nbx.getRankNameInGroup(config.GROUPID, data.robloxId)

            botMessage.setColor('8a8986')
            botMessage.setTitle("User Suspended Successfully")
            botMessage.setDescription(`${person} has been suspended`)
            botMessage.addFields(
                {name: "__**Previous Rank:**__", value: `${currentRankName}`, inline: true},
                {name: "__**For:**__", value: `${ms(ms(time))}`, inline: true}
            )
            botMessage.setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${data.robloxId}&width=420&height=420&format=png`)
            
            try{
                await nbx.setRank(config.GROUPID, data.robloxId, 2)
                await message.channel.send(botMessage)
            } catch(error) {
                await message.channel.send("An error has occured:\n ```diff\n- " + error + "\n```")
            }

            const revert = new MessageEmbed()
            .setTitle("E-Class Sentence Terminated")
            .setDescription(`${person} has finished its E Class Sentence, its previous rank has been reestablished`)
            .setColor('8a8986')

        setTimeout(async function () {
            try{
                await nbx.setRank(config.GROUPID, data.robloxId, currentRank)
                await message.channel.send(revert)
            } catch(error){
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
}