//这个是mongoose
const db = require('../utils/database');
let accountBase = db.model("accountBase", {
    code: String,
    status: String, // 1 已使用 0 未使用
    special: String,
    type: String, // 1 用户 2 群聊
    random: Number
});
let users = db.model("users", { // Schema
    name: {type: String, unique: true},
    pass: String,
    code: {type: String, unique: true}, // 唯一的code
    photo: {type: String, default: '/img/picture.png'}, // 默认头像
    signature: { type: String, default: '这个人很懒，暂时没有签名哦！' },
    nickname: { type: String, default: ''},
    email: { type: String, default: '2532xxxxx5@qq.com' },
    province: { type: Object, default: {name: "广东省", value: "440000"} }, // 省
    city: { type: Object, default: {name: "惠州市", value: "441300"} }, // 市
    town: { type: Object, default: {name: "惠东县", value: "441323"} }, // 县
    sex: { type: String, default: '3' }, // 0 男 1 女 3 保密
    chatColor: { type: String, default: '#ffffff' }, // 聊天文字颜色
    bgOpa: { type: Number, default: 0.2 }, // 聊天框透明度
    projectTheme: { type: String, default: 'vchat' }, // 项目主题
    wallpaper: { type: String, default: '/img/wallpaper1.jpg' }, // 聊天壁纸
    signUpTime: { type: Date, default: Date.now() }, // 注册时间
    lastLoginTime: { type: Date, default: Date.now() }, // 最后一次登录
    conversationsList: Array, // 会话列表 * name 会话名称 * photo 会话头像 * id 会话id * type 会话类型 group/ friend
    cover: { type: Array, default: ['/img/0072.jpg', '/img/0073.jpg'] }, // 照片墙展示
    emoji: Array, // 表情包，存的时表情包的code
    phone:{type:String,default:'156xxxxx338'}
});
module.exports = {
    accountBase,
    users
};