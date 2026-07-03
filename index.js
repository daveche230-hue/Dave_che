const TelegramBot = require('node-telegram-bot-api');
const mineflayer = require('mineflayer');
const fs = require('fs');

const tgToken = '8578905918:AAHcRx23RfToUQlHniU74Tu9GQg7HRDJ_FQ';
const tgBot = new TelegramBot(tgToken, { polling: true });
const MY_GROUP_ID = '-1003802238806'; 

// Загрузка базы привязок
let users = {};
if (fs.existsSync('users.json')) {
    users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
}

// 1. Подключение к Minecraft
const bot = mineflayer.createBot({
    host: 'mc.mineblaze.net',
    port: 25565,
    username: 'Build_ZoneBot',
    version: '1.20.1'
});

bot.once('spawn', () => {
    console.log("Бот Build_ZoneBot зашел на сервер");
    bot.chat('/login 12345678');
});

// 2. Команда /link в ЛС боту
tgBot.onText(/\/link (.+)/, (msg, match) => {
    const mcNick = match[1];
    users[mcNick] = msg.from.id;
    fs.writeFileSync('users.json', JSON.stringify(users));
    tgBot.sendMessage(msg.chat.id, `✅ Ник ${mcNick} привязан к твоему ID.`);
});

// 3. Команда /addzone в чате группы
tgBot.onText(/\/addzone (.+)/, async (msg, match) => {
    const targetMcNick = match[1];
    
    if (!users[targetMcNick]) {
        return tgBot.sendMessage(msg.chat.id, "❌ Сначала пусть игрок напишет /link в ЛС боту!");
    }

    try {
        // Проверка: есть ли человек в группе
        const member = await tgBot.getChatMember(MY_GROUP_ID, users[targetMcNick]);
        if (member.status !== 'left' && member.status !== 'kicked') {
            bot.chat(`/rg addmember eterniamoy ${targetMcNick}`);
            tgBot.sendMessage(msg.chat.id, `✅ Игрок ${targetMcNick} добавлен в eterniamoy.`);
        } else {
            tgBot.sendMessage(msg.chat.id, "❌ Игрока нет в нашей группе Eternia!");
        }
    } catch (e) {
        tgBot.sendMessage(msg.chat.id, "Ошибка: " + e.message);
    }
});
