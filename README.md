
### 食用
> 注意必须要有node、npm以及mongodb，项目默认mongodb IP地址为127.0.0.1:27017，可以在配置文件中修改。（chatServer\utils\database.js）
```
    cd chatRoom
    npm install 安装前端依赖
    npm start
    cd chatServer
    npm install 安装后端依赖
    npm run create 初始化数据库
    npm start 启动服务
    在浏览器中打开 localhost:9988 即可
```
没写过聊天应用，很感兴趣，然后通过socket.io写了一个，ui参考github上一个大神，添加了很多别的娱乐模块，挺有趣

![image-20200510222527294](README.assets/image-20200510222527294.png)