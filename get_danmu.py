# 参考：https://blog.csdn.net/qq_43017750/article/details/107771744
# 使用：python3 get_danmu.py --roomid xxxx
# roomid从直播网址中获取

import argparse
import requests
import time

parser = argparse.ArgumentParser(description='Get danmu in Bilibili stream.')
parser.add_argument('-r', '--roomid', help='bilibili room id')

args = parser.parse_args()


class Danmu():
    def __init__(self):
        # 弹幕url
        self.url = 'https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory'
        # 请求头
        self.headers = {
            'Host':
            'api.live.bilibili.com',
            'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0',
        }
        # 定义POST传递的参数
        self.data = {
            'roomid': args.roomid,
            'csrf_token': '',
            'csrf': '',
            'visit_id': '',
        }
        # 日志写对象
        self.log_file_write = open('danmu.log', mode='a', encoding='utf-8')
        # 读取日志
        log_file_read = open('danmu.log', mode='r', encoding='utf-8')
        self.log = log_file_read.readlines()

    def get_danmu(self):
        # 获取直播间弹幕
        html = requests.post(url=self.url,
                             headers=self.headers,
                             data=self.data).json()
        # 解析弹幕列表
        for content in html['data']['room']:

            # {'text': '所以才导致了现在的局面', 'uid': 139451, 'nickname': '如儿两个字太短', 'uname_color': '#00D1F1', 'timeline': '2021-05-14 21:29:39', 'isadmin': 1, 'vip': 0, 'svip': 0, 'medal': [], 'title': ['school-top4', 'title-13-1'], 'user_level': [52, 0, 16752445, 3620], 'rank': 10000, 'teamid': 0, 'rnd': '1620991332', 'user_title': 'title-13-1', 'guard_level': 3, 'bubble': 5, 'bubble_color': '#1453BAFF,#4C2263A2,#3353BAFF', 'check_info': {'ts': 1620998979, 'ct': 'EFDC8907'}, 'lpl': 0}
            # 其中 text uid nickname timeline 是有用的

            # 获取昵称
            nickname = content['nickname']
            # 获取发言
            text = content['text']
            # 获取发言时间
            timeline = content['timeline']

            simple_time = timeline.split(' ')[1]

            # 记录发言
            msg = simple_time + ' ' + nickname + ': ' + text
            # 判断对应消息是否存在于日志，如果和最后一条相同则打印并保存
            if msg + '\n' not in self.log:
                # 打印消息
                print(msg)
                # 保存日志
                self.log_file_write.write(msg + '\n')
                # 添加到日志列表
                self.log.append(msg + '\n')
            # 清空变量缓存
            nickname = ''
            text = ''
            timeline = ''
            msg = ''


# 创建bDanmu实例
bDanmu = Danmu()
while True:
    # 暂停防止cpu占用过高
    time.sleep(5)
    # 获取弹幕
    bDanmu.get_danmu()
