const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
    host: 'mc.mineblaze.net',
    port: 25565,
    username: 'Dave_che',
    version: '1.20.1'
});

bot.once('spawn', () => {
    console.log("Бот Dave_che запущен в автономном режиме");
    
    // Авто-логин
    setTimeout(() => {
        bot.chat('/login 007007007');
    }, 6000);

    // Авто-вход в клан
    setTimeout(() => {
        bot.chat('/c join Eternia');
    }, 10000);

    // Автономная реклама каждые 3 минуты (180 000 миллисекунд)
    setInterval(() => {
        const adText = "&4&lнабираем бойцов в боевое крыло eternia тренировки тактика стрельба спарринги четкая система рангов и прогресс только для тех кто готов к дисциплине и серьезным замесам  warp ArmiaEternia";
        bot.chat(adText);
    }, 180000);
});

