import fetch from './fetch';

export default {
  findMyfriends(params) { //查找我的好友
    return fetch.post('v/friend/findMyfriends', params);
  },
  checkMyfriends(params) { //查找我的好友
    return fetch.post('v/friend/checkMyfriends', params);
  },
  removeFriend(params) {
    return fetch.post('v/friend/removeFriend', params)
  }
//  detail用getUserInfo替代
//  huntFriend在user那里，因为主要是通过user的model进行查询
}

