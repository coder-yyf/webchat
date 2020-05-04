const db = require('./database');
let accountBase = db.model("accountBase", {
    // code: String,
    code:{type:String,unique:true},
    status: String, // 1 已使用 0 未使用
    special: String,
    //没有发挥作用
    type: String, // 1 用户 2 群聊
    random: Number // (随机数索引，用于随机查找一条)
});
let initAccount = () => {
    let index = 0;
    //先生成2000个
    for (let i = 10000000; i <= 10019999; i++) { // 首批用户默认账号 8位
        let account = new accountBase({ // 通过new Model1()创建的文档doc1，必须通过save()方法，才能将创建的文档保存到数据库的集合中
            code: i,
            status: '0',
            type: '1',
            random: Math.random()
        });
        account.save(function (error, newAccount) { // 回调函数是可选项，第一个参数为err，第二个参数为保存的文档对象
            if (error) {
                console.log("插入 " + account + " 错误:" + error);
            } else {
                console.log("已成功插入 " + newAccount);
            }
        });
    }
    //先生成2000个
    for (let i = 20000000; i <= 20019999; i++) { // 首批群聊默认账号 6位
        let account = new accountBase({
            code: i,
            status: '0',
            type: '2',
            random: Math.random()
        });
        account.save(function (error, newAccount) {
            index = i;
            if (error) {
                console.log("插入 " + account + " 错误:" + error);
            } else {
                console.log("已成功插入 " + newAccount);
            }
        });
    }
};
module.exports = {
    initAccount
};