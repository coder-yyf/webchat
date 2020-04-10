/*** Created by wyw on 2018/9/25.*/
const apiModel = require("../model/apiModel");

// 0成功 -1失败
const getUser = (req,res) => {
    apiModel.getUser((r) => { // 获取用户
        res.json({
            code : 0,
            data : r
        })
    })
};

const login = (req, res) => {
    let params = req.body;
    apiModel.login(params, (r) => { // 登录
        if (r.code === 0) {
            req.session.login = r.data.name;
            res.json({
                code : 0,
                data : r,
                msg: '登录成功'
            })
        } else {
            res.json({
                code : -1,
                data : '账号不存在或密码错误'
            })
        }
    })
};

const upUserInfo = (req, res) => { // 修改个人信息、主题等
    let params = req.body;
    let userName = req.session.login;
    apiModel.upUserInfo(userName, params, r => {
        if (r.code === 0) {
            res.json({
                code : 0,
                data : '设置成功'
            })
        } else {
            res.json({
                code : -1,
                data : '设置失败'
            })
        }
    })
};

const signUp = (req, res) => {
    let params = req.body;
    apiModel.signUp(params, (r) => { // 注册
        if (r.code === 1) {
            res.json({
                code : 1,
                data : '账号已存在'
            })
        } else if (r.code === 0) {
            res.json({
                code : 0,
                data : r.data
            })
        } else {
            res.json({
                code : -1,
                data : '注册失败'
            })
        }
    })
};

const loginOut = (req, res) => { // 登出
    req.session.destroy();
    res.json({
        code: 0,
        data: '退出成功'
    })
};

const getUserInfo = (req, res) => {
    let params = req.body;
    let key = {};
    //这个应该是哪里要根据id查找用的
    if (params.id) {
        //这里干嘛要这么弄，这样key中也有了id属性了，但是这个不是和。key属性的值一摸一样吗，
        // 哦，我知道了，这是为了后面用params.id判断用的，如果用params。key都是true
        key = Object.assign({key: params.id}, params);
    } else {
        //应该是登录后session就保存了登录状态，即login，应该是用户的name
        key = {key: req.session.login};
    }
    apiModel.getUserInfo(key, (r) => { // 获取登录用户信息
        if (r.code === 0) {
            //json格式返回到前端，类似end和send，code=0就是有这个人，有结果
            res.json({
                code : 0,
                data : r.data
            })
        } else {
            res.json({
                code : -1,
                data : ''
            })
        }
    })
};

const getVchatInfo = (req, res) => {
    apiModel.getVchatInfo((r) => { // 获取vchat官方账号信息
        if (r.code === 0) {
            res.json({
                code : 0,
                data : r.data
            })
        } else {
            res.json({
                code : -1,
                data : ''
            })
        }
    })
};

const getUserDetail =  (req, res) => {
    apiModel.getUserDetail(req.session.login, (r) => { // 获取登录用户详细信息
        if (r.code === 0) {
            res.json({
                code : 0,
                data : r.data
            })
        } else {
            res.json({
                code : -1,
                data : ''
            })
        }
    })
};

const addConversitionList = (req, res) => {
    let params = req.body;
    apiModel.addConversitionList(req.session.login, params, (r) => { // 添加会话
        if (r.code === 0) {
            res.json({
                code : 0,
                data : '添加成功'
            })
        } else {
            res.json({
                code : -1,
                data : '添加失败'
            })
        }
    })
};

const ServeraddConversitionList = (userName, params, callback=function () {}) => {
    apiModel.addConversitionList(userName, params, callback);
};

const removeConversitionList = (req, res) => {
    let params = req.body;
    apiModel.removeConversitionList(req.session.login, params, (r) => { // 删除会话
        if (r.code === 0) {
            res.json({
                code : 0,
                data : '移除成功'
            })
        } else {
            res.json({
                code : -1,
                data : '移除失败'
            })
        }
    })
};

const huntFriends = (req, res) => { // 搜索好友（名称/code）
    let params = req.body;
    apiModel.huntFriends(params, r => {
        if (r.code === 0) {
            res.json({
                code : 0,
                data : r.data,
                count: r.count
            });
        } else {
            res.json({
                code : -1,
                data : '查询失败'
            });
        }
    })
};

module.exports = {
    getUser,
    login,
    upUserInfo,
    signUp,
    loginOut,
    getUserInfo,
    getUserDetail,
    getVchatInfo,
    addConversitionList,
    removeConversitionList,
    huntFriends,
    ServeraddConversitionList
};
