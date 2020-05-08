<template>
  <div class="vchat-item">
    <div class="vchat-item-header">
      <span :class="{active: currNav === v.id}" v-for="(v, i) in navList" :key="v.id"
            @click="setCurrNav(v.id)" v-if="v.type.indexOf(currSation.type) > -1">
        {{v.name}}
      </span>
    </div>
    <div class="vchat-item-container" v-show="currNav === 0">
      <div class="container-chat">
        <!--聊天界面-->
        <!--其实这个loading可以像log那个样放到里面-->
        <div class="chat-room"
             v-loading="chatLoading"
             element-loading-text="拼命加载中"
             element-loading-spinner="el-icon-loading"
             element-loading-background="rgba(0, 0, 0, 0.8)"
        >
          <!--用到photoswipe-->
          <v-message :chatList="chatList" @lookPhoto="lookPhoto" @chatLoading="chatLoading = false"></v-message>
        </div>
        <!--发送界面-->
        <div class="chat-send">
          <!--工具栏-->
          <div class="tool">
            <span class="tool-item" v-watchMouse="showEmoji">
              <v-icon name="biaoqing1" :color="user.chatColor" @clickIcon="showEmoji.f = !showEmoji.f"
                      cursor="pointer" title="发送表情"></v-icon>
              <!--elmentui内置的折叠动画-->
              <el-collapse-transition>
                <div class="emoji-container" v-show="showEmoji.f">
                  <emoji @chooseEmoji="chooseEmoji" @chooseEmojiDefault="chooseEmojiDefault"></emoji>
                </div>
              </el-collapse-transition>
            </span>
            <span class="tool-item">
              <!--用的是iconfont-->
              <v-icon name="tupian2" :color="user.chatColor"></v-icon>
              <input type="file" title="选择图片" @change="InmageChange" ref="chooseInmage"
                     accept="image/png, image/jpeg, image/gif, image/jpg">
            </span>
            <span class="tool-item">
              <v-upload-popover :visible="uplaodVisible.f" @handleSuccess="uploadFileSuccess"
                                v-watchMouse="uplaodVisible">
                <v-icon name="wenjian2" :color="user.chatColor"
                        @clickIcon="uplaodVisible.f = !uplaodVisible.f" title="选择文件">
                </v-icon>
              </v-upload-popover>
            </span>
          </div>
          <textarea v-model="message" @keyup.enter="send(false)" v-fontColor="user.chatColor"></textarea>
          <!--发送-->
          <div class="enter">
            <button class="vchat-button-mini info" @click="clear">清空</button>
            <button class="vchat-button-mini" @click="send(false)">发送</button>
          </div>
        </div>
      </div>
      <!--群聊添加右边栏-->
      <div class="container-handel" v-if="currSation.type === 'group'">
        <!--通知-->
        <div class="handel-notice">
          <h3>群公告</h3>
          <ul>
            <li class="vchat-line1" title="快点交作业啦" style="color: #fff">
                快点交作业啦
            </li>
          </ul>
        </div>
        <!--成员-->
        <div class="handel-member">
          <h3>
            <span>群成员 ( {{onlineNum}}/{{groupUsers.length}} )</span>
            <v-icon class="el-icon-search" :color="user.chatColor" :size="16" @clickIcon="spreadInput"></v-icon>
          </h3>
          <input type="text" v-show="spread" ref="searchMember">
          <ul>
            <li v-for="v in groupUserList" :key="v.userId['_id']">
            <!--<li v-for="v in groupUserList" :key="v.userId">-->
              <a class="vchat-photo" :class="{lineOf: !v.status}">
                <!--通过连表查询获得的内容，要这样获取得到的属性-->
                <img :src="IMG_URL + v.userId.photo" alt="">
              </a>
              <span class="vchat-line1">{{v.userId.nickname}}</span>
            </li>
            <li>
              <p class="loadmore" v-if="groupUsers.length > groupUserList.length" @click="loadmore">
                <v-icon class="el-icon-loading" color="#fff" :size="14" v-if="loadmoreLoading"></v-icon>
                加载更多
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!--聊天记录-->
    <div class="vchat-item-container" v-show="currNav === 1">
      <!--chatloading也可以放到这里来吧-->
      <!--不行，会和外面这个冲突-->
      <message-log :currSation="currSation" :currNav="currNav" @lookPhoto="lookPhoto"></message-log>
    </div>
    <!--自定义的photoswipe-->
    <v-photo-swipe :visible="photoSwipeFlag" @close="photoSwipeFlag = false" :url="photoSwipeUrl"></v-photo-swipe>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  import api from '@/network';
  import utils from '@/common/utils';
  import emoji from './emoji.vue';
  import vMessage from './message.vue';
  import messageLog from './messageLog.vue';

  export default {
    name: 'chatItem',
    props: ['currSation'],
    data() {
      return {
        // type 0 共有 1 群聊 2 好友
        //type有两个的是说明共有
        navList: [
          {
            name: '聊天',
            type: 'group,friend',
            id: 0
          },
          {
            name: '聊天记录',
            type: 'group,friend',
            id: 1
          }
        ],
        IMG_URL: process.env.IMG_URL,
        currNav: 0,
        spread: false,
        chatList: [],
        message: '',
        showEmoji: {
          f: false
        },
        groupUsers: [], // 群成员
        uplaodVisible: {  // 上传
          f: false
        },
        photoSwipeFlag: false, //图片放大器
        photoSwipeUrl: '',
        onlineNum: 0, // 在线人数
        chatLoading: false,
        loadmoreLoading: false,
        groupUserList: [], // 长列表渲染
        offset: 1, // 群成员页码
        limit: 50  //显示群成员的数目
      };
    },
    components: {
      emoji,
      vMessage,
      messageLog
    },
    sockets: {
      //添加系统消息
      org(r) {
        if (r.roomid === this.currSation.id) {
          this.chatList.push(Object.assign({}, r, {type: 'org'}));
        }
      },
      //更新对面的消息
      mes(r) {
        if (r.roomid === this.currSation.id) {
          //添加进刚刚收到的新消息
          this.chatList.push(Object.assign({}, r, {type: 'other'}));
          this.$socket.emit('setReadStatus', {roomid: r.roomid, name: this.user.name});
          this.$store.commit('setUnRead', {roomid: r.roomid, clear: true});
        }
        else{
          this.$store.commit('setUnRead', {roomid: r.roomid, add: true, count: 1});
        }
      },
      getHistoryMessages(r) { // 获取历史消息
        if (r.length) {
          //更新contactlist里的news和newstime
          this.$emit('NewMes', r[r.length - 1]);
        }
        //对消息进行分类，分为公共的，我的和别人的
        this.chatList = r.map(v => {
          if (v.type !== 'org') {
            if (v.name === this.user.name) {
              v.type = 'mine';
            } else {
              v.type = 'other';
            }
          }
          return v;
        });
      }
    },
    computed: {
      ...mapState(['user', 'OnlineUser'])
    },
    watch: {
      currSation: { // 当前会话
        handler(v) {
          if (!v.id) {
            this.chatList = [];
          }
          this.offset = 1;
          this.groupUserList = [];
          this.chatLoading = true;
          this.currNav = 0; // 标签选中第一个
          if (v.type === 'group' || v.type === 'friend') {
            if (v.type === 'group') {
              this.getGroupUsers(v.id);
            }
            //roomid就是会话id，将这个房间的这个用户设置为对这个房间的所有信息都读了
            this.$socket.emit('setReadStatus', {roomid: v.id, name: this.user.name});
            //把当前的绘画的unread弄为0
            this.$store.commit('setUnRead', {roomid: v.id, clear: true});
            //前一百的历史消息
            this.$socket.emit('getHistoryMessages', {roomid: v.id, offset: 1, limit: 100});
          }
        },
        deep: true,
        immediate: true
      },
      OnlineUser: { // 在线成员
        handler(obj) {
          if (this.currSation.type && this.currSation.type === 'group') {
            this.getGroupUsers(this.currSation.id);
          }
        },
        immediate: true,
        deep: true
      }
    },
    mounted() {
    },
    methods: {
      lookPhoto(url) { // 查看原图
        this.photoSwipeUrl = url;
        this.photoSwipeFlag = true;
      },
      uploadFileSuccess(res, file) { // 上传成功
        if (file.raw.type.indexOf('image') > -1) {
          //data直接就是后端存储地址
          //这个直接就是url
          this.send(res.data, 'img');
        } else {
          //为了获取文件的名字，所以我们就用file，而不是res.data
          //这里用到上传的文件对象
          this.send(file, 'file');
        }
        this.uplaodVisible.f = false;
      },
      InmageChange() { // 发送图片
        let f = this.$refs['chooseInmage'].files[0];
        if (f.type.indexOf('image') === -1) {
          this.$message.error('只能上传图片!');
          return;
        }
        const isLt1M = f.size / 1024 / 1024 < 1;
        if (!isLt1M) {
          this.$message.error('图片大小不能超过 1MB!');
          return;
        }
        let formdata = new FormData();
        formdata.append('f', f);
        api.uploadFile(formdata).then(r => {
          if (r.code === 0) {
            this.send(r.data, 'img');
          } else {
            this.$message({
              message: '上传失败',
              type: 'warning'
            })
          }
        });
        this.$refs['chooseInmage'].value = '';
      },
      getGroupUserStatus(obj) { // 群成员在线状态
        this.groupUsers.forEach((v, i) => {
          let flag = false;
          Object.keys(obj).forEach(k => {
            if (k === v.userName) {
              flag = true;
            }
          });
          //不用assign？，对哦，asign是对一个的
          // this.$set(this.groupUsers, i, Object.assign({}, v, {status: flag}));
          this.groupUsers[i].status = flag;
        });
        //有了onlineusr这些还有啥意义
        this.onlineNum = this.groupUsers.filter(v => v.status).length;
        console.log(this.onlineNum)
      },
      setCurrNav(i) {
        this.currNav = i;
      },
      spreadInput() {
        this.spread = !this.spread;
        //自动focus，因为spread，为了防止异步影响，用nextTick
        this.$nextTick(_ => {
          this.$refs['searchMember'].focus();
        });
      },
      loadmore() {
        this.loadmoreLoading = true;
        this.offset += 1;
        setTimeout(v => {
          let page = (this.offset - 1) * this.limit;
          this.groupUserList = this.groupUserList.concat(this.groupUsers.slice(page, page + this.limit));
          this.loadmoreLoading = false;
        }, 1000);
      },
      getGroupUsers(id) { // 获取群成员
        let params = {
          groupId: id
        };
        api.getGroupUsers(params).then(r => {
          if (r.code === 0) {
            this.groupUsers = r.data;
            let page = (this.offset - 1) * this.limit;
            this.groupUserList = this.groupUsers.slice(page, page + this.limit);
            /*console.log(this.groupUsers);*/
            this.getGroupUserStatus(this.OnlineUser);
          }
        })
      },
      send(params, type = 'mess') { // 发送消息
        //params是为了当发送非文字的时候发挥作用的，单单一个‘’判断不可以的，所以弄个false
        if (!this.message && !params) {
          return;
        }
        let val = {
          name: this.user.name,
          mes: this.message,
          time: utils.formatTime(new Date()),
          avatar: this.user.photo,
          nickname: this.user.nickname,
          read: [this.user.name],
          roomid: this.currSation.id,
          style: 'mess',
          userM: this.user.id
        };
        if (type === 'emoji') { // 发送表情
          val.style = 'emoji';
          val.mes = '表情';
          val.emoji = params;
        } else if (type === 'img') {
          val.style = 'img';
          //这个其实是给右边最新消息用的
          val.mes = '图片';
          val.emoji = params;
        } else if (type === 'file') {
          val.style = 'file';
          val.mes = params.name;
          val.emoji = params.response.data;
          console.log(val.emoji)
        }
        //加入到chatList中
        this.chatList.push(Object.assign({}, val, {type: 'mine'}));
        //保存信息
        this.$socket.emit('mes', val);
        // 更新最新消息
        this.$emit('NewMes', val);
        //清空文字
        if (type === 'mess') { // 发送文字
          this.message = '';
        }
      },
      chooseEmojiDefault(em) {
        this.message += em;
        this.showEmoji.f = false;
      },
      chooseEmoji(url) {
        // console.log('jhhjj')
        this.send(url, 'emoji');
        this.showEmoji.f = false;
      },
      clear() { // 清空
        this.message = '';
      }
    }
  }
</script>

<style lang="scss" scoped>
  .vchat-item {
    width: 100%;
    height: 100%;

    .vchat-item-header {
      width: 100%;
      height: 32px;
      text-align: left;
      font-size: 16px;
      padding: 0 10px;
      box-sizing: border-box;
      background-color: rgba(0, 0, 0, 0.2);

      span {
        display: inline-block;
        height: 100%;
        line-height: 32px;
        padding: 0 5px;
        margin-right: 10px;
        box-sizing: border-box;
        cursor: pointer;
        position: relative;
        opacity: 0.8;
        overflow: hidden;
      }

      span:before {
        content: '';
        display: block;
        width: 100%;
        height: 2px;
        background-color: #f5f5f5;
        position: absolute;
        left: 0;
        bottom: 0;
        /*transition: transform 0.2s;*/
        transform: scale(0);
      }

      span:hover, span.active {
        opacity: 1;
      }

      span.active:before {
        transform: scale(1);
      }
    }

    .vchat-item-container {
      width: 100%;
      height: calc(100% - 32px);
      display: flex;
      justify-content: flex-start;

      .container-chat {
        /*width: 100%;
        height: 100%;
        min-width: 423.936px;*/
        width: 78%;
        height: 100%;
        box-sizing: border-box;
        border-right: 1px solid rgba(255, 255, 255, 0.3);

        .chat-room {
          width: 100%;
          height: 65%;
          min-height: 252.2px;
          box-sizing: border-box;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          overflow: hidden;
        }
        /*没什么用*/
        .message-content {
          width: 100%;
          height: 100%;
        }

        .chat-send {
          width: 100%;
          height: 35%;
          min-height: 135.8px;
          box-sizing: border-box;

          .tool {
            width: 100%;
            height: 28px;
            line-height: 28px;
            text-align: left;
            background-color: rgba(0, 0, 0, 0.3);
            padding: 0 10px;
            box-sizing: border-box;

            .tool-item {
              display: inline-block;
              height: 100%;
              position: relative;

              i {
                padding: 0 5px;
              }

              .emoji-container {
                width: 400px;
                height: 260px;
                position: absolute;
                bottom: 30px;
                left: 0;
                z-index: 10;
                transition: all 0.2s;
                /*transform: scaleX(0);*/
                /*opacity: 0;*/
              }
              input {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
              }
            }

            .tool-item:hover {
              background-color: rgba(255, 255, 255, 0.3);
            }
            /*没有用到*/
            .tool-item.active {
              background-color: rgba(255, 255, 255, 0.3);
            }
            /*右移一下子，没有用到，给表情图标用的*/
            .tool-item.active .emoji-container {
              transform: scaleX(1);
              opacity: 1;
            }

            i {
              margin: 0;
            }
          }

          textarea {
            width: 100%;
            height: calc(100% - 70px);
            background-color: transparent;
            resize: none;
            outline: none;
            font-size: 14px;
            padding: 5px 10px;
            box-sizing: border-box;
            border: none;
          }

          .enter {
            width: 100%;
            height: 32px;
            display: flex;
            justify-content: flex-end;

            button {
              margin-right: 10px;
            }
          }
        }
      }
      .container-handel {
        width: 22%;
        /*min-width: 164.864px;*/
        height: 100%;

        h3 {
          font-weight: normal;
          font-size: 16px;
          text-align: left;
          line-height: 16px;
          margin-bottom: 5px;

          i {
            float: right;
          }
        }

        .handel-notice {
          width: 100%;
          height: 40%;
          box-sizing: border-box;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          padding: 8px 10px;
          overflow-y: auto;
          font-size: 12px;
          text-align: left;

          ul {
            overflow-y: auto;

            li {
              margin-bottom: 2px;
            }

            li:hover {
              padding: 2px;
              box-sizing: border-box;
              background-color: rgba(255, 255, 255, 0.5);
              cursor: default;
            }
          }
        }

        .handel-member {
          width: 100%;
          height: 60%;
          box-sizing: border-box;
          padding: 8px 10px;
          font-size: 12px;

          ul {
            overflow-y: auto;
            height: 100%;
          }
          input {
            box-sizing: border-box;
            width: 100%;
            border: 1px solid #d5d5d5;
            padding-left: 5px;
            outline: none;
            color: #323232;
          }

          li {
            padding: 5px 0;
            display: flex;
            justify-content: flex-start;
            align-items: center;

            span {
              min-width: 110px;
              text-align: left;
            }
          }

          li:last-child {
            padding-bottom: 20px;
          }

          .loadmore {
            width: 100%;
            text-align: center;
            cursor: pointer;
          }

          a {
            width: 26px;
            min-width: 26px;
            height: 26px;
            margin-right: 5px;
          }

          a.lineOf {
            -webkit-filter: grayscale(85%); /* Chrome, Safari, Opera */
            filter: grayscale(85%);
          }
        }
      }
    }
  }
</style>
