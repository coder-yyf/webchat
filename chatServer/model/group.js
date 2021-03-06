const db = require('../utils/database');
//这个实际上是mongoose
const baseList = require('./baseList');
//奇怪这里的schema为什么不是通过mongoose.Schema来创建的呢，普通对象也行？
let groups = db.model("groups", {
  title: String,
  desc: String,
  img: String,
  code: String,
  //这个是一个很关键的地方，避免重复查询
  userNum: Number, // 群成员数量，避免某些情况需要多次联表查找，如搜索；所以每次加入一人，数量加一
  createDate: {type: Date, default: Date.now()}, // 建群时间
  holderName: String // 群主账号
});

let groupUserSchema = new db.Schema({
  groupId: {
    type: db.Schema.ObjectId,
    ref: 'groups'
  },
  userId: {
    type: db.Schema.ObjectId,
    //关联到users的model那里
    ref: 'users'
  },
  //防止又要去找用户的名字用的
  userName: {type: String},
  //1表示是群主，man是管理员，1表示是管理员
  manager: {type: Number, default: 0},
  holder: {type: Number, default: 0}
});

//通过约束添加静态方法
groupUserSchema.statics = {
  //其实用uerid也行吧，联系列表
  findGroupByUserName: function (userName, callback) { // 通过用户名查找所在群聊列表
    return this
        .find({userName: userName})
        .populate('groupId')  // 关联查询
        .exec(callback)
  },
  //群成员用
  findGroupUsersByGroupId: function (groupId, callback) { // 通过群id查找用户信息
    return this
        .find({groupId: groupId})
        //通过uerId关联对应的user的collection，然后获取
        //返回内容包含了找到的group内容外，还有对应的select里挑的内容
        .populate({path: 'userId', select: 'signature photo nickname'})  // 关联查询
        .exec(callback)
  }
};

let groupUser = db.model("groupUser", groupUserSchema); // groupUser model

const createGroup = (params, callback) => { // 新建群
  function createfun(code) {
    groups.create({
      title: params.groupName,
      desc: params.groupDesc,
      img: params.groupImage,
      code: code,
      userNum: 1,
      holderName: params.userName
    }).then(r => {
      if (r['_id']) {
        // 查询userId  loginname 无法关联查询，有该用户，但是感觉没必要啊，用login其实也行了，也可以得到rs
        baseList.users.find({name: params.userName}).then(rs => {
          if (rs.length) {
            //加入到groupuser中
            groupUser.create({
              userName: params.userName,
              userId: rs[0]._id,
              manager: 0,
              // 建群后创建群主
              holder: 1,
              groupId: r['_id']
            }).then(res => {
              if (res['_id']) {
                callback({code: 0, data: r});
              } else {
                //失败后删除群
                groups.remove({'_id': r['_id']}, 1);
                callback({code: -1});
              }
            });
          } else {
            //没有该用户后删除
            groups.remove({'_id': r['_id']}, 1);
            callback({code: -1});
          }
        });
      } else {
        callback({code: -1});
      }
    })
  }

  function fineOneAccountBase(createfun) { // 号码池查找code
    let rand = Math.random();
    baseList.accountBase.findOneAndUpdate({type: '2', status: '0', random: {$gte: rand}}, {status: '1'}, (err, doc) => {
      if (err) {
        console.log(err);
      } else {
        if(doc){
          createfun(doc.code);
        }
      }
    });
  }

  fineOneAccountBase(createfun);
};

//联系列表查找
const getMyGroup = (params, callback) => { // 查找我的群
  groupUser.findGroupByUserName(params.userName, (err, groups) => {
    if (err) {
      console.log(err);
      callback({code: -1, data: err});
    } else {
      callback({code: 0, data: groups})
    }
  })
};

//进入群聊查找
const getGroupUsers = (params, callback) => { // 查找指定群聊成员
  groupUser.findGroupUsersByGroupId(params.groupId, (err, users) => {
    if (err) {
      console.log(err);
      callback({code: -1, data: err});
    } else {
      callback({code: 0, data: users})
    }
  })
};

// $equals 等于 ／ $gt 大于 ／ $gte 大于等于 ／ $lt 小余 ／ $lte 小余等于 ／ $ne 不等于 ／ $in 在数组中 ／ $nin 不在数组中 // $option的$i表示忽略大小写
// 搜索聊天群（名称/code）
const huntGroups = (params, callback) => {
  //存储已加入的群
  let ids = [];
  //先搜出用户加入的群，然后去掉加入过的
  groupUser.findGroupByUserName(params.userName, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      res.forEach(v => {
        ids.push(v.groupId['_id']);
      });
      let key = new RegExp(params.key);
      let arr = [];
      //type2是根据群名
      params.type === '2' ? arr = [{'title': {'$regex': key, $options: '$i'}}] : arr = [{
        'code': {
          '$regex': key,
          $options: '$i'
        }
      }];
      groups.count(
          {
            $or: arr,
            '_id': {$nin: ids} // 搜索时排除用户已加入的群
          }, (err, count) => {
            if (count > 0) {
              groups.find(
                  {
                    $or: arr,
                    '_id': {$nin: ids}
                  }
              )
                 /* .skip((params.offset - 1) * params.limit)
                  .limit(params.limit)*/
                  .sort({'title': 1})
                  .then(r => {
                    callback({code: 0, data: r, count: count});
                  }).catch(err => {
                console.log(err);
                callback({code: -1});
              });
            } else {
              callback({code: 0, data: [], count: 0});
            }
          });
    }
  });
};

const getGroupInfo = (params, callback) => { // 查找群详细信息
  groups.find({'_id': params.groupId}).then(r => {
    if (r.length) {
      groupUser.findGroupUsersByGroupId(params.groupId, (err, users) => {
        if (err) {
          console.log(err);
        } else {
          callback({code: 0, data: r[0], users: users})
        }
      })
    } else {
      callback({code: -1})
    }
  });
};

const InsertGroupUsers = (params, callback) => { // 添加新成员 userNum + 1  $inc 增加或减少
  let val = {
    groupId: params.groupId,
    userName: params.name,
    userId: params.userM
  };
  //先找有没有
  groupUser.find({groupId: params.groupId, userId: params.userM}).then(res => {
    if (!res.length) {
      //在groupUser中添加
      groupUser.create(val).then(r => {
        if (r['_id']) {
          //查有没有这个群，对应的群的人数+1
          groups.update({'_id': params.groupId}, {$inc: {"userNum": 1}}).then(raw => {
            //成功修改
            if (raw.nModified > 0) {
              callback({code: 0});
            } else {
              //为啥不先在groups中修改，有的话再添加建groupUser中，不用插入又删除了啊
              groupUser.deleteOne({'_id': r['_id']});
              callback({code: -2});
            }
          });
        } else {
          callback({code: -1});
        }
      });
    } else {
      callback({code: -3});
    }
  });

};

const quitGroup = (params, callback) => {
  groupUser.remove({groupId: params.groupId, userId: params.userId}).then(r => {
        if (r.n > 0) {
          callback({code: 0})
          groups.update({'_id': params.groupId}, {$inc: {"userNum": -1}}).then(raw => {
            //成功修改
            if (raw.nModified > 0) {
              console.log('-1成功')
            } else {
              console.log('-1失败')
            }
          })
        } else {
          callback({code: -1})
        }
      }
  ).catch(err => {
    callback({code: -1})
  })
}

const destroyGroup = (params,callback)=>{
  groupUser.remove({groupId:params.groupId}).then(r=>{
    if(r.n>0){
      groups.remove({'_id': params.groupId}).then(r=>{
        if(r.n>0){
          callback({code:0})
        }
        else{
          callback({code:-1})
        }
      })
    }
    else{
      callback({code:-1})
    }
  }).catch(err=>{
    callback({code:-1})
  })
}

module.exports = {
  createGroup,
  getMyGroup,
  getGroupUsers,
  huntGroups,
  getGroupInfo,
  InsertGroupUsers,
  quitGroup,
  destroyGroup
};
