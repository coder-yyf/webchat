const db = require('../utils/database');

let messages = db.model("messages", {
  roomid: String, // 房间id
  name: String, // 用户登录名
  nickname: String, // 用户昵称
  time: String, // 时间
  avatar: String, // 用户头像
  mes: String, // 消息
  read: Array, // 是否已读 0/1，应该是每条信息用这个来存已经读了这条信息的用户名吧
  //这个似乎没用
  signature: String, // 个性签名
  emoji: String, // 表情地址或者其他图片和文件的地址
  //可以混杂的例如emoji和普通的消息
  style: String, // 消息类型 emoji/mess/img/file
  groupId: String, // 加入群聊id
  groupName: String, // 加入群聊名称
  groupPhoto: String, //加入群聊头像
  userM: {
    type: db.Schema.ObjectId,
    ref: 'users'
  }, // 申请人id、消息发送人
  userY: String, // 好友id
  userYname: String, // 好友昵称
  userYphoto: String, // 好友头像
  userYloginName: String, // 好友登录名
  friendRoom: String, // 好友房间
  state: String, // group/ friend
  type: String, // validate，info，org
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
      //userM是user里面的ObjectId
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
        //count是用来干嘛的，用来给聊天历史那些弄分页什么的
        callback({code: 0, data: r, count: count});
      }).catch(err => {
    console.log(err);
    callback({code: -1});
  });
};
const getHistoryMessages = (params, reverse, callback) => { // 保存消息
  if (reverse === 2) { // 聊天记录
    messages.count({roomid: params.roomid}, (err, count) => {
      if (count > 0) {
        getMessage(params, callback, count);
      } else {
        callback({code: 0, data: [], count: 0});
      }
    });
  } else if (reverse === 1) {
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
// updateMany 一次更新多条
const setReadStatus = (params) => { // 消息设置为已读
  messages.find({'roomid': params.roomid})
      .then(raw => {
        raw.forEach(v => {
          //没有读到的添加到读到的
          if (v.read.indexOf(params.name) === -1) {
            //name是用户名，这个和定义的不一样啊，定义的时数组，0或者1，这里是什么鬼
            //应该是每条信息用这个来存已经读了这条信息的用户名吧
            v.read.push(params.name);
            v.save();
          }
        })
      })
      .catch(err => console.log('setReadStatus失败', err));
};

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