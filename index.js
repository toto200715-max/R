const {
    Client,
    Intents,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
    default: Discord
 } = require("discord.js");

  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.MESSAGE_CONTENT,
      Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
  });
  const db = require("croxydb");
  const prefix = `+`

  client.on('ready', () => {
    console.log(`${client.user.tag} is ready`);
    const status = db.get(`Status_${client.user.id}`);
    if (status) {
        client.user.setStatus(status);
    }
    const activity = db.get(`Activity_${client.user.id}`);
    if (activity) {
        client.user.setActivity(activity);
    }
});

  client.on('messageCreate', async (message) => {
     if (message.content.startsWith(prefix + `setup-autorole`)) {
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            return message.reply('لا يوجد لديك الصلاحيات الكافية لفعل هذا')
        }

        let role = message.mentions.roles.first() || message.content.split(" ")[1]

        

        if (!role) {
            return message.reply(`الرجاء منشن او اضافة ايدي رتبة`)
        }

        if (!role.id) {
            role = await message.guild.roles.fetch(role)
        }

        await db.set(`autoRole_${message.guild.id}`, role.id)

        message.reply('تمت اضافة الرتبة بنجاح')
    }
    if (message.content.startsWith(prefix + "delete-autorole")) {
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            return message.reply('لا يوجد لديك الصلاحيات الكافية لفعل هذا')
        }

        let role = await db.get(`autoRole_${message.guild.id}`)

        if (!role) {
            return message.reply(`هذا الخادم ليس لديه رتبة تلقائية محددة`)
        }

        await db.delete(`autoRole_${message.guild.id}`)

        message.reply('تمت ازالة الرتبة بنجاح')
    }     
    });
  client.on('guildMemberAdd', async (member) => {
    let autorole = await db.get(`autoRole_${member.guild.id}`)

    if (autorole) {
       let role = await member.guild.roles.fetch(autorole)

       if (role) {
        await member.roles.add(role.id)
       }
    }
  });

  


client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + 'set-status')) {
      if (!message.member.permissions.has('ADMINISTRATOR')) return;
      const activity = message.content.split(' ').slice(1).join(' ');
      if (!activity) return message.reply({ content: '**حط اسم الحاله يابرو**' });
      client.user.setActivity(activity);
      db.set(`Activity_${client.user.id}`, activity);
      const row = new MessageActionRow()
          .addComponents(
              new MessageSelectMenu()
                  .setCustomId('select')
                  .setPlaceholder('Select bot status')
                  .addOptions([
                      { label: 'dnd', value: 'dnd', emoji: '🔴' },
                      { label: 'idle', value: 'idle', emoji: '🟠' },
                      { label: 'online', value: 'online', emoji: '🟢' },
                      { label: 'offline', value: 'offline', emoji: '⚫' },
                  ])
          );
      message.reply({ content: 'Select', components: [row] });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu()) return;
  if (interaction.customId === 'select') {
      if (!interaction.member.permissions.has('ADMINISTRATOR')) return;
      switch (interaction.values[0]) {
          case 'dnd':
              client.user.setStatus('dnd');
              db.set(`Status_${client.user.id}`, 'dnd');
              interaction.message.edit({ content: ':white_check_mark: Done', components: [] });
              break;
          case 'idle':
              client.user.setStatus('idle');
              db.set(`Status_${client.user.id}`, 'idle');
              interaction.message.edit({ content: ':white_check_mark: Done', components: [] });
              break;
          case 'online':
              client.user.setStatus('online');
              db.set(`Status_${client.user.id}`, 'online');
              interaction.message.edit({ content: ':white_check_mark: Done', components: [] });
              break;
          case 'offline':
              client.user.setStatus('invisible');
              db.set(`Status_${client.user.id}`, 'idle');
              interaction.message.edit({ content: ':white_check_mark: Done', components: [] });
              break;
      }
  }
});


client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + 'set-avatar')) {
      if (!message.member.permissions.has('ADMINISTRATOR')) return message.reply({ content: 'You do not have permission to use this command.' });
      const newAvatarUrl = message.content.split(' ').slice(1).join(' ');
      if (!newAvatarUrl) return message.reply({ content: '**من فضلك ضع رابط الصوره بشكل صحيح**' });
      try {
          await client.user.setAvatar(newAvatarUrl);
          message.reply({ content: '**تم تغيير صوره البوت بنجاح**' });
      } catch (error) {
          console.error('Error changing bot avatar:', error);
          message.reply({ content: '**لم يمكنني من تغيير الصوره**' });
      }
  }
});


client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + 'set-name')) {
      if (!message.member.permissions.has('ADMINISTRATOR')) return message.reply({ content: 'You do not have permission to use this command.' });
      const newName = message.content.split(' ').slice(1).join(' ');
      if (!newName) return message.reply({ content: '**من فضلك يجب عليك كتباه الاسم الجديد ب شكل صحيح**' });
      try {
          await client.user.setUsername(newName);
          message.reply({ content: `**تم تغيير اسم البوت الي\`${newName}\`**` });
      } catch (error) {
          console.error('Error changing bot name:', error);
          message.reply({ content: '**لم يمككني من تغيير اسمي**' });
      }
  }
});



client.on('messageCreate', async message => {
    if (message.content.startsWith(prefix + 'help')) {
    const help = new MessageEmbed()
    .setAuthor(message.author.username, message.author.avatarURL())
    .setDescription(`**${prefix}setup-autorole : لتسطيب الرول التلقائية\n${prefix}delete-autorole : لازالة الرول التلقائية \n${prefix}help : لارسال قائمة الاوامر\n${prefix}set-status : لتغيير حالة البوت\n${prefix}set-avatar : لتغيير صورة البوت\n${prefix}set-name : لتغيير اسم البوت**`)
    .setThumbnail(message.guild.iconURL())
    .setTimestamp()
    .setColor(`#000000`)
    .setFooter(message.guild.name, message.guild.iconURL());
    message.reply({ embeds: [help] });
    }
  });





  
  client.login();