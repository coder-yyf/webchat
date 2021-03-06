import fetch from './fetch';

export default {
    login(params) { // 登录
      // return fetch.post('http://localhost:9988/yyf');
        return fetch.post('v/user/login', params);
    },
    signUp(params) { // 注册
        return fetch.post('v/user/signUp', params);
    },
    loginOut() { // 注册
        return fetch.post('v/user/loginOut');
    },
    getUserInfo(params) { //获取用户信息
        //把promise对象再返回来
        return fetch.post('v/user/getUserInfo', params);
    },
    upUserInfo(params) { // 设置主题
        return fetch.post('v/user/upUserInfo', params);
    },
    getUserDetail() { // 获取个人设置用户信息
        return fetch.post('v/user/getUserDetail');
    },
    getVchatInfo() { // 获取vchat官方账号信息
        return fetch.post('v/user/getVchatInfo');
    },
    addConversitionList(params) { // 添加会话
        return fetch.post('v/user/addConversitionList', params);
    },
    removeConversitionList(params) { // 移除会话
        return fetch.post('v/user/removeConversitionList', params);
    },
    huntFriends(params) { // 添加好友
        return fetch.post('v/user/huntFriends', params);
    }
}

