require('dotenv').config()

const { createClient } = require("oicq");
const uin = process.env.QQ_ACCOUNT; // your account
const bot = createClient(uin);

//监听上线事件
bot.on("system.online", () => console.log("Logged in!"));

//监听消息并回复
bot.on("message", (data) => data.reply("hello world"));

//监听滑动验证码事件并输入ticket
bot.on("system.login.slider", () => {
  process.stdin.once("data", (input) => {
    bot.sliderLogin(input);
  });
});

bot.login(process.env.QQ_PASSWORD); // your password or password_md5