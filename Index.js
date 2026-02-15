const { Client, LocalAuth } = require('whatsapp-web.js');
const { Telegraf } = require('telegraf');
const express = require('express');
const qrcode = require('qrcode-terminal');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || 'PASTE_YOUR_TOKEN_HERE';
const app = express();
const bot = new Telegraf(TELEGRAM_TOKEN);
let waClient;

const wa = new Client({
  authStrategy: new LocalAuth({ clientId: "dosti-deals" }),
  puppeteer: { 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  }
});

wa.on('qr', qr => {
  console.log('📱 QR CODE - PHONE SE SCAN KARO:');
  qrcode.generate(qr, { small: true });
});
wa.on('authenticated', () => console.log('✅ WA Authenticated!'));
wa.on('ready', async () => {
  console.log('🚀 WA Ready!');
  const chats = await wa.getChats();
  const group = chats.find(c => c.name && c.name.includes('Dosti Deals'));
  if (group) console.log('📝 GROUP ID: ' + group.id._serialized);
});

bot.start((ctx) => ctx.reply('🔌 Bridge ready! Message bhejo.'));
bot.on('text', async (ctx) => {
  if (!waClient) return ctx.reply('⏳ WA ready nahi');
  try {
    const groupId = process.env.GROUP_ID || '';
    const chat = await waClient.getChatById(groupId);
    await chat.sendMessage(ctx.message.text);
    ctx.reply('✅ Dosti Deals mein bhej diya!');
  } catch (e) { ctx.reply('❌ Error: ' + e.message); }
});

waClient = wa;
wa.initialize();
bot.launch();

app.get('/', (req, res) => res.send('Bridge running!'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Server on'));
