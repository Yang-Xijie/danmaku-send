require("dotenv").config();

const { connectLogger } = require("log4js");
const { createClient } = require("oicq");
const uin = process.env.QQ_ACCOUNT; // your account
const bot = createClient(uin);

// 监听上线事件
bot.on("system.online", () => console.log("Logged in!"));

// ----- START

// 监听私聊
bot.on("message.private", (data) => {
  bot.sendPrivateMsg(data.user_id, "hello");

  if (data.user_id == 564197835) data.reply("怎么是你");
});

// 监听群聊
bot.on("message.group", (data) => {
  bot.sendGroupMsg(data.group_id, "hello");

  if (data.group_id == 205059735) {
    bot.sendGroupMsg(data.group_id, "我在");

    const received_message = data.message[0].data.text;

    const reg_check_message_bilibili_danmu =
      /转发((B|b)(站|ilibili)|)(直播|)[0-9]*(弹幕|)/;
    const reg_get_bilibili_room_id = /[0-9]*/;

    console.log(data.message[0].data);
    console.log(data.message[0].data.text);

    if (reg_check_message_bilibili_danmu.test(received_message)) {
      const bilibili_room_id = received_message.replace(/[^0-9]/ig, ""); // 提取数字room_id
      console.log("haha");
      console.log(bilibili_room_id);
      console.log("haha");
      bot.sendGroupMsg(data.group_id, "要开始转发了哦～");
    }
  }
});

// ----- END

// 监听滑动验证码事件并输入ticket
// https://github.com/takayama-lily/oicq/wiki/01.滑动验证码和设备锁
bot.on("system.login.slider", () => {
  process.stdin.once("data", (input) => {
    bot.sliderLogin(input);
  });
});

bot.login(process.env.QQ_PASSWORD); // your password or password_md5
