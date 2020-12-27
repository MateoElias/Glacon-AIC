const {
    MessageEmbed
} = require('discord.js');
const fetch = require('node-fetch');
const nbx = require('noblox.js');
const config = require('../../config.json');

async function roleManager(guildMember, removeRole, addRole){
    var roleToAdd = guild.roles.cache.find(r => r.name == addRole)
    var roleToDelete = guild.roles.cache.find(r => r.name == removeRole)
    guildMember = await guildMember.roles.add(roleToAdd)
    guildMember = await guildMember.roles.remove(roleToDelete)
}

module.exports = {
    name: "setrank",
    description: "Changes the rank of a user in roblox",
    run: async (client, message, args) => {

       if (!message.member.hasPermission('KICK_MEMBERS')) return;

        const ping = message.mentions.users.first();
        const rankName = message.content.split(" ").slice(2).join(" ");
        var rank = 0;

        if (!ping) return message.channel.send("Please mention the user you want to change the rank of")
        if (!rankName) return message.channel.send("Please state the rank name")

        const botMessage = new MessageEmbed()
        .setTimestamp()

        var user = await fetch(`https://verify.eryn.io/api/user/${ping.id}`)
        user = await user.json()

        let userName = user.robloxUsername

        if (user.status == 'ok') {
            botMessage.setColor('f7c705')
            user = user.robloxId

            let oldRank = await nbx.getRankInGroup(config.GROUPID, user)
            if(oldRank == 0) return message.channel.send("This user is not in group")
            if(oldRank >= 100) return message.channel.send("I can't rank that high")

            switch (rankName.toLowerCase()) {
                case 'd class' || 'class d':
                    rank = 1
                    break;

                case 'e class' || 'class e':
                    rank = 2
                    break;

                case 'level 0':
                    rank = 10
                    break;

                case 'level 1':
                    rank = 20
                    break;

                case 'level 2':
                    rank = 30
                    break;

                case 'level 3':
                    rank = 50
                    break;

                case 'level 4':
                    rank = 80
                    break;
                
                case 'facility director':
                    rank = 100
                    break;

                default:
                    message.channel.send("I was unable to find that rank's name. \n Please check spelling (**No dashes must be added**)")
                    break;
            }

            if (rank == 0) return;

            const oldRankName = await nbx.getRole(config.GROUPID, oldRank)
            const newRank = await nbx.getRole(config.GROUPID, rank)
            botMessage.setTitle("User Ranked Successfully")
            botMessage.setAuthor("SCPF Ranking System", 'http://scp-wiki.wdfiles.com/local--files/aiad-homescreen/glacon_00.png')
            botMessage.addFields({
                name: "__**User:**__",
                value: userName,
                inline: true
            }, {
                name: "__**Old Rank:**__",
                value: oldRankName.name,
                inline: true
            }, {
                name: "__**Newer Rank:**__",
                value: newRank.name,
                inline: true
            })
            botMessage.setFooter('Ranking System Provided by O5-6')
            roleManager(ping.id, oldRankName.name, newRank.name)
            try {
                await nbx.setRank(config.GROUPID, user, rank)
                await message.channel.send(botMessage)
                
            } catch (error) {
                await message.channel.send("An error has occured:\n ```diff\n- " + error + "\n```")
            }

        } else {
            botMessage.setColor('de0202')

            switch (user.errorCode) {
                case 404:
                    botMessage.setDescription("This discord account is not linked to any roblox account. Please redirect them [here](https://verify.eryn.io/)\nContact O5-6 if the error persists")
                    botMessage.setTitle("Error Code 404")
                    break;

                case 429:
                    botMessage.setDescription("Too many requests are being performed, please retry again after **" + user.retryAfterSeconds + "** seconds. \nContact O5-6 if the error persists.")
                    botMessage.setTitle("Error Code 429")
                    break;

                default:
                    botMessage.setDescription("There was an error while fetching the account.\nPlease contact O5-6 if the error persists.")
                    botMessage.setTitle("Error Code " + user.errorCode)
            }
            message.channel.send(botMessage)
        }

    }
}