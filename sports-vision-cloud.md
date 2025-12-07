 Vercel 的网址了（类似 sports-vision-cloud.vercel.app

使用方式

  访问地址

  - 网站：https://sports-vision-cloud.vercel.app
  - 任何设备（手机/电脑/平板）打开浏览器访问即可

  测试账户

| 用户名 | 密码    | 姓名 |
| ------ | ------- | ---- |
| demo1  | demo123 | 张三 |
| demo2  | demo123 | 李四 |
| demo3  | demo123 | 王五 |

  注意事项

  1. 后端冷启动：Render免费版服务器会在15分钟无访问后休眠，首次访问可能需要等待30-60秒唤醒
  2. 数据重置：如果演示数据乱了，访问这个地址重置：
    POST https://sports-vision-cloud.onrender.com/admin/reset-demo-data
  3. 硬件对接：等你的香橙派/STM32下位机准备好后，让设备调用后端API即可实现真实数据上报：

    - 设备注册：POST /api/v1/devices/register
    - 心跳上报：POST /api/v1/devices/heartbeat
    - 训练数据：POST /api/v1/training/sessions
  4. 免费额度：

    - Vercel（前端）：无限制
    - Render（后端）：每月750小时免费
    - MongoDB Atlas：512MB免费存储