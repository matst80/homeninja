var settings = require("./settings"),
    TelegramBot = require('node-telegram-bot-api'),
    homeninja = require("../nodehelper/nodehelper").init(settings);

const bot = new TelegramBot(settings.token, {polling: true});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  
  // send a message to the chat acknowledging receipt of their message 
  bot.sendMessage(chatId, 'Received your message');
});

bot.onText(/\/hn (.+)/, (msg, match) => {
    
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever" 
    homeninja.sendJson("telegram/text",{from:msg.chat.id,message:msg});
    // send back the matched "whatever" to the chat 
    bot.sendMessage(chatId, resp);
  });

homeninja.on('connect',function() {
  var serverNode = {
    features:['notification','chatbot'],
    name:'telegram bot',
    topic:'telegram/bot'
  };
  
  homeninja.client.subscribe('telegram/+');
  
  homeninja.sendNodes([serverNode]);
  // Matches "/echo [whatever]" 
  
  
  // Listen for any kind of message. There are different kinds of 
  // messages. 
  
  //sendDevices();
});

homeninja.client.on('message', function (topic, msg) { 
  data = {id: settings.defaultChatId, message:msg};
  if (msg.indexOf('{')!=-1) {
    data = JSON.parse(msg.toString());
  }
  if (topic=='telegram/send')
  {
    bot.sendMessage(data.id||settings.defaultChatId,data.message);
  }
});




