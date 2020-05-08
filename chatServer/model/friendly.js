const db = require('../utils/database');

let friendlySchema = new db.Schema({
  userM: {
    type: db.Schema.ObjectId,
    ref: 'users'
  },
  userY: {
    type: db.Schema.ObjectId,
    ref: 'users'
  },
  createDate: {type: Date, default: Date.now()}// 加好友时间
});

friendlySchema.statics = {
  findFriendByUserM: function (userId, callback) { // 通过userM查找userY信息
    return this
        .find({userM: userId}).populate({path: 'userY', select: 'signature photo nickname'})  // 关联查询
        .exec(callback)
  },
  findFriendByUserY: function (userId, callback) { // 通过userY查找userM信息
    return this
        .find({userY: userId}).populate({path: 'userM', select: 'signature photo nickname'})  // 关联查询
        .exec(callback)
  }
};

let friendly = db.model("friendlies", friendlySchema); // friendly 创建的文档是 friendlies 坑！！！

//之所以这样，是因为我们加好友的时候是只添加了一条文档，你-好友，或者好友-你，这样两次查询就不会漏掉了
const findMyfriends = (params, callback) => { // 查找我的好友
  friendly.findFriendByUserM(params.userId).then(userM => {
    friendly.findFriendByUserY(params.userId).then(userY => {
      let data = [];
      // 整合找到的好友
      //userId在前的差查找结果
      userM.forEach(v => {
        data.push({
          createDate: v.createDate,
          nickname: v.userY.nickname,
          photo: v.userY.photo,
          signature: v.userY.signature,
          id: v.userY._id,
          //给会话房间用的
          roomid: params.userId + '-' + v.userY._id
        })
      });
      //userId在后的查找结果
      userY.forEach(v => {
        data.push({
          createDate: v.createDate,
          nickname: v.userM.nickname,
          photo: v.userM.photo,
          signature: v.userM.signature,
          id: v.userM._id,
          roomid: v.userM._id + '-' + params.userId
        })
      });
      callback({code: 0, data: data})
    })
  })
};

const checkMyfriends = (params, callback) => { // 验证是否已加为好友
  let pr = {userM: params.userY, userY: params.userM};
  //两种顺序都弄一下
  friendly.find(params).then(r => {
    if (r.length > 0) {
      callback({code: 0, data: true})
    } else {
      friendly.find(pr).then(r => {
        if (r.length > 0) {
          callback({code: 0, data: true})
        } else {
          callback({code: 0, data: false})
        }
      })
    }
  }).catch(err => {
    callback({code: -1, data: err})
  })
};

const addFriend = (params, callback) => { // 增加好友记录
  let pr = {
    userM: params.userM,
    userY: params.userY
  };
  //其实是两次查询
  //加了好友，有其中一个就行了吧
  friendly.find(pr).then(m => {
    friendly.find({
      userM: params.userY,
      userY: params.userM
    }).then(y => {
      if (!(m.length + y.length)) {
        friendly.create(pr).then(r => {
          if (r['_id']) {
            callback({code: 0});
          } else {
            callback({code: -1});
          }
        })
      } else {
        callback({code: -3});
      }
    });
  });
};

const removeFriend = (params, callback) => {
  console.log('这里是model')
  // callback({code:0})
  friendly.remove({userM: params.myId, userY: params.friendId}).then(r => {
        if (r.n > 0) {
          callback({code: 0});
        } else {
          friendly.remove({userM: params.friendId, userY: params.myId}).then(r => {
                if (r.n > 0) {
                  callback({code: 0});
                } else {
                  callback({code: -1});
                }
              }
          )
        }
      }
  ).catch(err => {
    callback({code: -1})
  })
}


module.exports = {
  findMyfriends,
  removeFriend,
  checkMyfriends,
  addFriend
};
