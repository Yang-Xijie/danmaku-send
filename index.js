require("dotenv").config();

const { createClient } = require("oicq");
const uin = process.env.QQ_ACCOUNT; // your account
const bot = createClient(uin);
const path = require("path");
const { spawn } = require("child_process");

function runGetDanmu(roomid) {
  return spawn("python3", [
    "-u",
    path.join(__dirname, "get_danmu.py"),
    "--roomid",
    roomid,
  ]);
}

// 监听上线事件
bot.on("system.online", () => console.log("Logged in!"));

// ----- START

// 监听私聊
bot.on("message.private", (data) => {
  bot.sendPrivateMsg(data.user_id, "hello");

  if (data.user_id == 564197835) data.reply("怎么是你");
});

var subprocess_pid = -1; // 在bot.on里面设置变量的话

// 监听群聊
bot.on("message.group", (data) => {
  bot.sendGroupMsg(data.group_id, "hello");

  if (data.group_id == 205059735) {
    bot.sendGroupMsg(data.group_id, "我在");

    const received_message = data.message[0].data.text;

    console.log(received_message);

    const reg_check_message_bilibili_danmu =
      /^转发((B|b)(站|ilibili)|)(直播|)[0-9]*(弹幕|)$/;
    if (reg_check_message_bilibili_danmu.test(received_message)) {
      const bilibili_room_id = received_message.replace(/[^0-9]/gi, ""); // 提取数字room_id
      console.log(`roomid: ${bilibili_room_id}`);
      bot.sendGroupMsg(data.group_id, "要开始转发了哦～");

      // 使用python脚本创建子进程进而获取输出值
      const subprocess = runGetDanmu(bilibili_room_id);

      subprocess_pid = subprocess.pid;
      console.log(`subprocess.pid: ${subprocess.pid}`);
      console.log(`subprocess_pid: ${subprocess_pid}`);

      // print output of script
      subprocess.stdout.on("data", (output) => {
        console.log(`output:${output}`);
        bot.sendGroupMsg(data.group_id, String(output)); // 注意这里要send的话，需要将output转换为String()
      });
      subprocess.stderr.on("data", (error) => {
        console.log(`error:${error}`);
      });
      subprocess.on("close", () => {
        console.log("Python script finished.");
      });
    }

    const reg_check_message_stop_bilibili_danmu = /停止(转发|)/;
    if (reg_check_message_stop_bilibili_danmu.test(received_message)) {
      bot.sendGroupMsg(data.group_id, "收到了停止转发的消息");
      console.log(`stop_subprocess_pid: ${subprocess_pid}`);
      if (subprocess_pid != -1) {
        process.kill(subprocess_pid, "SIGINT"); 
        subprocess_pid = -1;
      }
      bot.sendGroupMsg(data.group_id, "嗯 停了");
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
