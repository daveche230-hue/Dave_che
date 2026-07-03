const TelegramBot = require('node-telegram-bot-api');
const mineflayer = require('mineflayer');
const fs = require('fs');

// --- НАСТРОЙКИ ---
const tgToken = '8578905918:AAHcRx23RfToUQlHniU74Tu9GQg7HRDJ_FQ';
const MY_GROUP_ID = '-1003802238806'; // ID группы Eternia
const MC_LOGIN_PASSWORD = '12345678';
const MC_REGION_NAME = 'eterniamoy'; // Название твоего региона
// -----------------

const tgBot = new TelegramBot(tgToken, { polling: true });

// Загрузка базы привязок
let users = {};
if (fs.existsSync('users.json')) {
    try {
        users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    } catch (e) {
        users = {};
    }
}

// 1. Подключение к Minecraft
const bot = mineflayer.createBot({
    host: 'mc.mineblaze.net',
    port: 25565,
    username: 'Build_ZoneBot',
    version: '1.20.1'
});

bot.once('spawn', () => {
    console.log("Бот зашел на сервер");
    bot.chat(`/login ${MC_LOGIN_PASSWORD}`);
    
    // Задержка перед вводом команды режима
    setTimeout(() => {
        bot.chat('/s1');
        console.log("Режим s1 активирован");
    }, 2000);
});

// Обработка ошибок, чтобы бот не «падал» молча
bot.on('error', console.error);
bot.on('kicked', console.log);

// 2. Команда /link в ЛС боту в Telegram
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
        return tgBot.sendMessage(msg.chat.id, "❌ Игрок не привязал ник! Пусть напишет боту /link Ник в личку.");
    }

    try {
        // Проверка: есть ли человек в группе
        const member = await tgBot.getChatMember(MY_GROUP_ID, users[targetMcNick]);
        
        // Статус 'left' или 'kicked' значит, что игрока нет в группе
        if (member.status !== 'left' && member.status !== 'kicked') {
            bot.chat(`/rg addmember ${MC_REGION_NAME} ${targetMcNick}`);
            tgBot.sendMessage(msg.chat.id, `✅ Игрок ${targetMcNick} добавлен в регион ${MC_REGION_NAME}.`);
        } else {
            tgBot.sendMessage(msg.chat.id, "❌ Игрока нет в нашей группе Eternia!");
        }
    } catch (e) {
        tgBot.sendMessage(msg.chat.id, "Ошибка проверки прав: " + e.message);
    }
});
