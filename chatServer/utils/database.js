//连接数据库
const mongoose = require('mongoose');
//怎么我没用也行啊，难道是这里用的mongoose的等级比较低
mongoose.connect('mongodb://127.0.0.1:27017/chat');//升级后必须带的,表示客户端去连接服务器
// { useMongoClient: true }
//mongoose不是都支持pormise吗，应该是这里的mongoose的等级比较低
mongoose.Promise = global.Promise; //node里有global的全局变量，让mongose里默认的Promise使用node里的Promise,让mongoose也能用node的语法
module.exports = mongoose;