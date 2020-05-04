const db = require('../utils/database');

let messages = db.model("messages", {
  roomid: String, // 房间id，这个是系统的那个公告的房间
  name: String, // 用户登录名
  nickname: String, // 用户昵称
  time: String, // 时间
  avatar: String, // 用户头像
  mes: String, // 消息
  read: Array, // 是每条信息用这个来存已经读了这条信息的用户名
  //这个似乎没用，有用，是系统消息那里可以看到
  signature: String, // 个性签名
  emoji: String, // 表情地址或者其他图片和文件的地址
  //可以混杂的例如emoji和普通的消息，它用来决定气泡到底显示的是什么
  style: String, // 消息类型 emoji/mess/img/file
  groupId: String, // 加入群聊id
  groupName: String, // 加入群聊名称
  groupPhoto: String, //加入群聊头像
  //用户这边加会话以及防止用户信息修改用
  userM: {
    type: db.Schema.ObjectId,
    ref: 'users'
  }, // 申请人id、消息发送人
  //这些都很有用，在系统消息里显示还有加入会话列表都会用到
  userY: String, // 好友id
  userYname: String, // 好友昵称
  userYphoto: String, // 好友头像
  userYloginName: String, // 好友登录名
  friendRoom: String, // 好友房间
  state: String, // group/ friend
  type: String, // validate，info，org,mine,other
  status: String // 0 未操作 1 同意 2 拒绝 这个是给官方的消息那里弄的
});

const saveMessage = (params, callback = function () {
}) => { // 保存消息
  messages.create(params).then(r => {
    if (r['_id']) {
      callback({code: 0, data: 'ok'});
    } else {
      callback({code: -1});
    }
  })
};

const removeMessage = (params, callback) => { // 删除消息
  messages.remove(params).then(raw => {
    if (raw.n > 0) {
      callback({code: 0});
    } else {
      callback({code: -1});
    }
  })
};

let getMessage = (params, callback, count = 0) => {
  messages.find({roomid: params.roomid})
  //userM是user里面的ObjectId,我的mes不是已经又下面这些了吗，不用再找一遍吧
  //    噢用来防止修改了
      .populate({path: 'userM', select: 'signature photo nickname'}) // 关联用户基本信息
      //按照时间从最新开始，这里的time是messages的
      .sort({'time': -1})
      .skip((params.offset - 1) * params.limit)
      .limit(params.limit)
      .then(r => {
        r.forEach(v => { // 防止用户修改资料后，信息未更新
          if (v.userM) {
            v.nickname = v.userM.nickname;
            v.avatar = v.userM.photo;
            v.signature = v.userM.signature;
          }
        });
        r.reverse();
        //count是用来给聊天历史那些弄分页的
        callback({code: 0, data: r, count: count});
      }).catch(err => {
    console.log(err);
    callback({code: -1});
  });
};
const getHistoryMessages = (params, reverse, callback) => { // 保存消息
  //查询的聊天记录
  if (reverse === 2) {
    messages.count({roomid: params.roomid}, (err, count) => {
      if (count > 0) {
        getMessage(params, callback, count);
      } else {
        callback({code: 0, data: [], count: 0});
      }
    });
  } else if (reverse === 1) {
    //当前聊天界面记录
    getMessage(params, callback);
  //  获得系统消息
  } else if (reverse === -1) {
    //其实时getmessage少了一个reverse没有了关联而已
    messages.find({roomid: params.roomid})
        .sort({'time': -1})
        .skip((params.offset - 1) * params.limit)
        .limit(params.limit)
        .then(r => {
          callback({code: 0, data: r});
        }).catch(err => {
      console.log(err);
      callback({code: -1});
    });
  }
};
// updateMany 一次更新多条，这是聊天界面的
const setReadStatus = (params) => { // 消息设置为已读
  messages.find({'roomid': params.roomid})
      .then(raw => {
        raw.forEach(v => {
          //没有读到的添加到读到的
          if (v.read.indexOf(params.name) === -1) {
            //每条信息用这个来存已经读了这条信息的用户名吧
            v.read.push(params.name);
            v.save();
          }
        })
      })
      .catch(err => console.log('setReadStatus失败', err));
};

//通知里一次多条
const setMessageStatus = (params) => { // 验证消息设置为已通过
  messages.find({'userM': params.userM})
      .then(raw => {
        raw.forEach(v => {
          if (v.type === "validate" && (v.state === 'friend' || v.state === 'group')) {
            //已同意
            v.status = params.status;
            v.save();
          }
        })
      })
      .catch(err => console.log('setMessageStatus失败', err));
};

const upMessage = (params, callback) => { // 更新status
  messages.update({'_id': params['_id']}, {status: params.status}).then(raw => {
    if (raw.nModified > 0) {
      callback({code: 0});
    } else {
      callback({code: -1});
    }
  })
};

module.exports = {
  saveMessage,
  getHistoryMessages,
  setReadStatus,
  upMessage,
  removeMessage,
  setMessageStatus
};