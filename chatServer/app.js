let express = require('express');
let path = require('path');
let utils = require('./utils/utils');
//这个我index里面弄了，这里就不用了吧
// let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser'); // cookie
let bodyParser = require('body-parser'); // post请求需要的中间件
let session = require("express-session"); // session
//nodejs代理
// let proxy = require('http-proxy-middleware');
let compression = require('compression');

let app = express();
let server = require('http').Server(app);
//创建http服务的sockt，即websocket
let io = require('socket.io')(server);
// let cors = require('cors')

const api = require('./routes/api');
const user = require('./routes/user');
const group = require('./routes/group');
const friend = require('./routes/friendly');
const expression = require('./routes/expression');
const messages = require('./routes/messages');
const todo = require('./routes/todo');

//使用jade模板引擎，并指定模板目录
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
//没有了竟然也可以，我觉得是前端解决了跨域就没问题了，根本不用这个
let options = { // 解决静态资源跨域问题（或者使用cors模块）
    setHeaders: function (res, path, stat) {
        res.set('Access-Control-Allow-Origin', '*')
    }
};
app.use(express.static(path.join(__dirname, 'public'), options)); // 静态资源中间件
// app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
//这个就是cors解决，就是给响应response弄的header添加这些东西，
// 返回response就不会被浏览器拦截
//前端代理了，这里也要代理？而且这下面的只是用来访问别的网站用的？不用解决前端到后端的跨域问题吗，
// 明明运行前端的时候端口都不一样
// 后端解决跨域的方式 , 现选择前端代理

/*app.use(cors())
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});*/

//nodejs代理，解决开发跨域
// 网易新闻
/*app.use('^/touch*', proxy({ // 配置代理转发
    target: "https://3g.163.com",
    changeOrigin: true
}));*/
// 上面2个东西没什么用啊，关了前端代理一点用都没有
//都不会过来，还代理个鬼，人接直接访问去了
app.use('/v*', (req, res, next) => {
  //登陆了
  if (req.session.login) {
    next();
  } else {
    //发起登陆或注册，但是还没登陆
    if (req.originalUrl === '/v/user/login' || req.originalUrl === '/v/user/signUp') {
      next();
      //    既没登录又不是请求登陆或注册，丢一个空的东西给他
    } else {
      /*res.json({
        status: 0
      });*/
      let err = new Error('You don\'t have permission');
      err.status = 401;
      next(err);
    }
  }
});

//主要是文件上传的
app.use('/v/api', api);
app.use('/v/user', user);
app.use('/v/group', group);
app.use('/v/friend', friend);
app.use('/v/expre', expression);
app.use('/v/mes', messages);
app.use('/v/todo', todo);
//终结了请求，不会往下面的中间件的
app.get('/', (req, res) => {
  res.sendfile(__dirname + '/index.html');
});

//在线用户
const OnlineUser = {};
const apiList = require('./controller/apiList');
const onconnection = (socket) => {
  //一连接服务器就出发，无论有没有登录
  console.log('连接了Socket.io');
  socket.emit('connect');
  //conversationlist中都会发过来
  /*socket.on('login', (val) => {
    OnlineUser[val.name] = socket.id;
    socket.broadcast.emit('login', OnlineUser);
  })*/
  socket.on('join', (val) => {
    if (!OnlineUser[val.name]) {
      OnlineUser[val.name] = socket.id;
      // socket.broadcast.emit('joined', OnlineUser);
    }
    socket.join(val.roomid, () => {
      // 包括发送者，更新前端的上线用户
      io.in(val.roomid).emit('joined', OnlineUser);
      //这个发给自己
      // socket.emit('joined', OnlineUser);
      //这个根本不能发给自己
      // socket.in(val.roomid).emit('joined', OnlineUser);
    });
  });
  //这里是主动下线，例如退出那里
  socket.on('leave', (val) => {
    console.log('删除会话退出房间')
    socket.leave(val.roomid, () => {
    });
  });
  //用户下线了
  socket.on('logout', (val) => {
    delete OnlineUser[val.name];
    // socket.to(val.roomid).emit('logout', OnlineUser);
    //更新前端在线用户
    socket.broadcast.emit('logout', OnlineUser);
  })
  socket.on('mes', (val) => { // 聊天消息
    apiList.saveMessage(val);
    //更新对面聊天界面视图
    //原来main里面也有个mes
    socket.to(val.roomid).emit('mes', val);
  });
  //其实下面这两个不用socket。io也行的
  socket.on('getHistoryMessages', (pramas) => {
    //1是获取聊天界面的聊天记录
    apiList.getHistoryMessages(pramas, 1, (res) => {
      if (res.code === 0) {
        socket.emit('getHistoryMessages', res.data); // 发送给发送者（当前客户端）
      } else {
        console.log('查询历史记录失败');
      }
    });
  });

  socket.on('getSystemMessages', (pramas) => {
    // -1是聊天历史记录
    apiList.getHistoryMessages(pramas, -1, (res) => {
      if (res.code === 0) {
        // 发送给发送者（当前客户端）
        socket.emit('getSystemMessages', res.data);
      } else {
        console.log('查询vchat历史记录失败');
      }
    });
  });

  socket.on('agreeValidate', (val) => { // 同意好友或加群申请
    if (val.state === 'group') { // 群聊验证
      //插入到groupusers集合中
      apiList.InsertGroupUsers(val, r => {
        if (r.code === -1) {
          console.log('加入群聊失败');
        } else if (r.code === -2) {
          console.log('更新群成员数量失败');
        } else if (r.code === -3) {
          console.log('群成员已存在');
        } else if (r.code === 0) {
          let pr = {
            status: '1',
            userM: val['userM']
          };
          //这个是更新多条，将之前的都弄为同意，而up只是弄一个
          apiList.setMessageStatus(pr);
          // 通知申请人验证已同意
          let value = {
            name: '',
            //groupName是group那里弄过来的消息才有的
            mes: val.userYname + '同意你加入' + val.groupName + '!',
            time: utils.formatTime(new Date()),
            read: [],
            status: '1', // 同意
            state: 'group',
            //这个是给官方用的消息
            type: 'info',
            //会话房间号，1是vchat的id
            roomid: val.userM + '-' + val.roomid.split('-')[1]
          };
          apiList.saveMessage(value); // 保存通知消息
          let params = {
            name: val.groupName,
            photo: val.groupPhoto,
            id: val.groupId,
            type: 'group'
          };
          //用户登录名
          //给申请成功的用户的会话列表添加会话
          apiList.ServeraddConversitionList(val.name, params, () => {
            //发给除了自己之外，getUserInfo
            socket.to(value.roomid).emit('takeValidate', value);
            // 通知群聊，对应的群会出现xxx加入了群聊
            let org = {
              type: 'org',
              nickname: val.nickname,
              time: utils.formatTime(new Date()),
              roomid: val.groupId
            };
            apiList.saveMessage(org); // 保存通知消息
            socket.to(org.roomid).emit('org', org);
          }); // 添加到申请人会话列表
        }
      });
    } else if (val.state === 'friend') { // 写入好友表
      //忽略掉没用的signature那些
      apiList.addFriend(val, r => {
        if (r.code === 0) {
          let pr = {
            status: '1',
            userM: val['userM']
          };
          //将之前不同意的都同意了
          apiList.setMessageStatus(pr);
          // 通知申请人验证已同意
          let value = {
            name: '',
            // 注意是Y，也就是被请求的
            mes: val.userYname + '同意了你的好友请求！',
            time: utils.formatTime(new Date()),
            read: [],
            state: 'friend',
            type: 'info',
            status: '1', // 同意
            //1是vchat的id
            roomid: val.userM + '-' + val.roomid.split('-')[1]
          };
          apiList.saveMessage(value); // 保存通知消息
          let userMparams = { // 申请人信息
            name: val.nickname,
            photo: val.avatar,
            id: val.friendRoom,
            type: 'friend'
          };
          let userYparams = { // 好友信息
            name: val.userYname,
            photo: val.userYphoto,
            id: val.friendRoom,
            //醉了，这里是list的类型，不是mes类型，别搞混了，不过这个似乎没什么用
            type: 'friend'
          };
          //给双方都添加对应的conversationlist
          apiList.ServeraddConversitionList(val.name, userYparams, () => {
            apiList.ServeraddConversitionList(val.userYloginName, userMparams, () => {
              //给申请人发的,getUserInfo
              socket.to(value.roomid).emit('takeValidate', value);
              //回到被申请人那里，getUserInfo
              socket.emit('validateSuccess');
            }); // 添加到自己会话列表
          }); // 添加到申请人会话列表
        } else {
          console.log('添加好友失败');
        }
      });
    }
  });

  socket.on('refuseValidate', (val) => {
    //2是拒绝
    //_id究竟哪来的，哦，原来是takeValidate用了getUserInfo
    let pr = {
      status: '2',
      _id: val['_id']
    };
    //更新信息
    apiList.upMessage(pr);
    // console.log('refuseValidate', val);
    if (val.state === 'group') {
      let value = {
        name: '',
        mes: val.userYname + '拒绝了你加入 ' + val.groupName + ' 的申请!',
        time: utils.formatTime(new Date()),
        read: [],
        state: 'group',
        type: 'info',
        // status: '-1', // 拒绝
        status: '2',
        //1其实就是vchat的id
        roomid: val.userM + '-' + val.roomid.split('-')[1]
      };
      apiList.saveMessage(value); // 保存通知消息
      socket.to(value.roomid).emit('takeValidate', value);
    } else if (val.state === 'friend') {
      let value = {
        name: '',
        mes: val.userYname + '拒绝了你的好友请求！',
        time: utils.formatTime(new Date()),
        read: [],
        state: 'friend',
        //注意这里的-1和前面的1同意，2拒绝不一样，那个是validate类型的，而这个是info类型的
        //不过info的1也是同意，嘿嘿
        // status: '-1', // 拒绝
        status: '2',
        //信息类
        type: 'info',
        roomid: val.userM + '-' + val.roomid.split('-')[1]
      };
      // console.log('saveMessage', value);
      apiList.saveMessage(value); // 保存通知消息
      //main和system中
      socket.to(value.roomid).emit('takeValidate', value);
    }
    // 通知申请人验证已拒绝
  });
  socket.on('removeFriendValidate', (params) => {
    // console.log(params.myRoomId,params.friendRoomId)
    // socket.emit('removeValidate', params.roomid)
    //这两个反过来其实是一样的，所以roomid是同一个
    console.log(params)
    // setTimeout(()=>{
    io.in(params.roomid).emit('removeFriendValidate', params.roomid)
    // io.to(params.roomid).emit('removeValidate', params.roomid)
    // },1000)
    // socket.in(params.roomid).emit('removeValidate', params.roomid+'2222')
    // socket.broadcast.emit('removeValidate', params.roomid+'3333')
  })
  socket.on('destroyGroupValidate',params=>{
    socket.to(params.groupId).emit('destroyGroupValidate', params.groupId)
  })
  //这个其实也没必要用socket
  socket.on('setReadStatus', (params) => { // 已读状态
    apiList.setReadStatus(params);
  });
  socket.on('sendValidate', (val) => { // 发送验证消息
    apiList.saveMessage(val);
    socket.to(val.roomid).emit('takeValidate', val);
  });
  //这里可以弄一个下线的信息啊，不过也得登录啊，这可怎么搞
  //这里是被动掉线
  socket.on('disconnect', (val) => {
    let k;
    for (k in OnlineUser) {
      //删掉下线的那个
      if (OnlineUser[k] === socket.id) {
        console.log('user disconnected', OnlineUser[k]);
        delete OnlineUser[k];
        // socket.broadcast.emit('leaved', OnlineUser); // 广播通知该客户端下线，其实是更新在线人数
        socket.broadcast.emit('logout', OnlineUser); // 广播通知该客户端下线
      }
    }
  });
};
//这里就在监听上线了
io.on('connection', onconnection);


// catch 404 and forward to error handler
//万能匹配
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  //执行出来error的中间件
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  //装逼写法
  res.locals.message = err.message;
  //开发才有，但是如果前后端是同一个服务器，或者要添加查询报错时，也是需要err的
  //不过，确实给用户看这些err也没多大意义，不过查询报错要添加进来吧
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //渲染error界面
  res.render('error');
});

server.listen(9988, () => {
  console.log('服务器在9988启动')
});
