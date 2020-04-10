<template>
  <div class="vchat-chatRoom" v-bgInmage="IMGURL + user.wallpaper.split(',')[0]" v-fontColor="user.chatColor">
    <!--用ab和index在下面面，然后控制opa来进行调控背景透明度-->
    <div class="chatRoom-before" v-opacity="bgOpa"></div>
    <div class="vchat-chatRoom-bg">
      <div class="chat-header">
        <a v-fontColor="user.chatColor">{{currSation.name}}</a>
        <div class="chat-handel">
          <v-icon class="el-icon-minus" :color="user.chatColor" cursor="pointer" @clickIcon="close"></v-icon>
          <v-icon class="el-icon-setting" :color="user.chatColor" cursor="pointer"
                  @clickIcon="settingFlag.f = true"></v-icon>
        </div>
      </div>
      <div class="chat-container">
        <ul class="chat-conversation-ul">
          <li class="chat-conversation-li" v-for="(v, i) in contactsList" :key="v.id"
              :class="{active: currSation.id === v.id}" @click="setCurrSation(v)">
            <el-badge :value="v.unRead" :max="99" class="mesBadge" :hidden="v.unRead === 0">
              <a class="vchat-photo">
                <img :src="IMGURL + v.photo" alt="">
              </a>
            </el-badge>
            <!--会话名（昵称或群昵称），最新消息缩略-->
            <div class="chat-conversation-li-center">
              <!--这种事官方推送，为什么用template？-->
              <!--template不会渲染成元素-->
              <template v-if="v.type === 'vchat'">
                <p class="vchat-line1">{{v.nickname}}</p>
                <p class="vchat-line1">{{v.signature}}</p>
              </template>
              <!--这种是每一个会话-->
              <template v-else>
                <p class="vchat-line1">{{v.name}}</p>
                <p class="vchat-line1">{{v.newMes}}</p>
              </template>
            </div>
            <!--最新消息时间-->
            <div class="chat-conversation-li-right">
              <p>{{v.newMesTime}}</p>
              <!--放这里更合适-->
              <!--这样子没有用-->
              <!--<p class="delete" @click="remove(v,i)">-->
              <p class="delete">
                <el-tooltip class="item" effect="dark" :content="v.type === 'vchat' ? '从会话列表移除' : '从列表移除后，需要再次添加才能收到消息！'"
                            placement="top-start">
                  <!--这样就行了-->
                  <v-icon class="el-icon-circle-close" :color="user.chatColor" cursor="pointer" :size="18" @clickIcon="remove(v,i)"></v-icon>
                </el-tooltip>
              </p>
            </div>
            <!--<p class="delete" @click.stop="remove(v, i)">
              <el-tooltip class="item" effect="dark" :content="v.type === 'vchat' ? '从会话列表移除' : '从列表移除后，需要再次添加才能收到消息！'"
                          placement="top-start">
                <v-icon class="el-icon-circle-close" :color="user.chatColor" cursor="pointer" :size="18"></v-icon>
              </el-tooltip>
            </p>-->
            <!--click实践没有生效-->
            <!--click.stop是阻止冒泡-->
          </li>
        </ul>
        <div class="chat-content-box">
          <!--父传子，然后子传父-->
          <!--这是聊天信息-->
          <chat-item :currSation="currSation" @NewMes="getNewMes" v-show="currSation.type !== 'vchat'"></chat-item>
          <!--官方-->
          <vchat-message v-show="currSation.type === 'vchat'" :currSation="currSation"></vchat-message>
        </div>
      </div>
      <div class="chat-setting" :class="{active: settingFlag.f}" v-watchMouse="settingFlag">
        <!--点击空白处？不是，点击空白处时上面v-watch干的-->
        <chat-setting @clickIcon="settingFlag.f = false"></chat-setting>
      </div>
    </div>
  </div>
</template>
<script>
  import chatItem from './chat-item.vue';
  import vchatMessage from './vchatSystemMessage.vue';
  import chatSetting from './chatSetting.vue';
  import {mapState} from 'vuex';
  import api from '@/api';

  export default {
    name: 'vChat',
    data() {
      return {
        currSation: {}, //当前会话
        contactsList: [], // 会话列表
        IMGURL: process.env.IMG_URL,
        settingFlag: { // 设置面板
          f: false
        },
        removeSation: {}
      }
    },
    sockets: {},
    components: {
      chatItem,
      vchatMessage,
      chatSetting
    },
    watch: {
      conversationsList: {
        handler(list) {
          //本来就是数组，为什么要添加这个？
          //contactlist和conversationlist有什么区别？
          //contactlist添加了什么newstime和newMsg
          //这样弄就不是指向一样的地址了
          this.contactsList = JSON.parse(JSON.stringify(list));
          /*console.log(this.conversationsList)
          console.log('********')
          console.log(this.contactsList)*/
          //用这个会抽风的
          // this.contactsList = list;
          //初始
          if (!this.currSation.id && list.length) {
            this.currSation = this.contactsList[0];
          }
          if (!list.length) {
            this.currSation = {};
          }
          //也就是index是数字
          //删除了一个会话
          if (!isNaN(this.removeSation.index)) {
            if (this.currSation.id === this.removeSation.item.id && this.contactsList.length !== 0) {
              //为什么要是删除了的index？
              this.currSation = this.contactsList[this.removeSation.index] || this.contactsList[this.removeSation.index - 1] || this.contactsList[this.removeSation.index + 1];
            }
          }
        },
        deep: true,
        immediate: true
      },
      //它的news和time都是点进去后通过加载history然后获得第一条弄得
      contactsList: {
        handler(list) {
          if (!list.length) {
            this.currSation = {};
          }
        },
        deep: true,
        //不是也应该添加吗
        immediate:true
      },
      //哪里初始化它的
      unRead: {
        handler(list) {
          this.contactsList.forEach((v, i) => {
            list.forEach(m => {
              if (v.id === m.roomid) {
                //添加了unread属性
                this.$set(this.contactsList, i, Object.assign({}, v, {unRead: m.count}));
              }
            });
          })
        },
        deep: true,
        immediate: true
      }
    },
    computed: {
      ...mapState(['user', 'conversationsList', 'unRead']),
      bgOpa() { // 兼容老用户
        return this.user.bgOpa || 0.2;
      }
    },
    methods: {
      //传给父了
      close() {
        this.$emit('closeChat');
      },
      setCurrSation(v) {
        if (v.id === this.currSation.id) {
          return;
        }
        this.currSation = v;
      },
      getNewMes(m) { // 获取最新一条消息
        this.contactsList.forEach((v, i) => {
          if (v.id === m.roomid) {
            this.$set(this.contactsList, i, Object.assign({}, v, {newMes: m.mes, newMesTime: m.time.split(' ')[1]}));
          }
        })
      },
      remove(v, i) {
        // console.log('闪出')
        //去掉vchat官方
        if (v.type === 'vchat') { // 只做显示列表移除，也就是下次重新进来它还会加入？
          // 从contactlist中去掉
          this.contactsList = this.contactsList.filter(m => m.id !== v.id);
          //这个不是和conversationlist哪里修改当前会话一样吗
          if (this.currSation.id === v.id && this.contactsList.length !== 0) {
            //轮下去
            this.currSation = this.contactsList[i] || this.contactsList[i - 1] || this.contactsList[i + 1];
          }
        } else {
          api.removeConversitionList(v).then(r => {
            if (r.code === 0) {
              this.$message({
                type: 'success',
                message: '移除成功'
              });
              this.$store.commit('setConversationsList', Object.assign({d: true}, v));
//                            this.contactsList = this.contactsList.filter(m => m.id !== v.id);
              this.removeSation = {
                item: v,
                index: i
              };
            } else {
              this.$message({
                type: 'success',
                message: '移除失败'
              });
            }
          })
        }
      }
    },
    mounted() {
    }
  }
</script>

<style lang="scss" scoped>
  .vchat-chatRoom {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    position: relative;

    .chatRoom-before {
      display: block;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      background-color: #000;
    }

    .vchat-chatRoom-bg {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
    }

    .chat-header {
      width: 100%;
      height: 40px;
      text-align: center;
      position: relative;
      line-height: 40px;
      box-sizing: border-box;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 16px;

      a {
        color: #fff;
        padding: 2px 5px;
        display: inline-block;
      }

      .chat-handel {
        position: absolute;
        right: 0;
        top: 0;
        padding-right: 15px;

        i {
          padding: 8px 4px 3px;
        }

        i:hover {
          background-color: rgba(255, 255, 255, 0.5);
        }
      }
    }

    .chat-container {
      width: 100%;
      height: calc(100% - 40px);
      display: flex;
      justify-content: flex-start;

      .chat-conversation-ul {
        /*width: 20%;*/
        width: 24%;
        /*min-width: 147.2px;*/
        /*min-width: 220.8px;*/
        padding-bottom: 20px;
        box-sizing: border-box;
        border-right: 1px solid rgba(255, 255, 255, 0.2);
        /*添加滚动条*/
        /*overflow-y: auto;*/
        /*为什么横向没有啊*/
        /*难道是因为层级而被覆盖了？*/
        overflow: auto;
      }

      .chat-conversation-li {
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        overflow: hidden;
        text-align: left;
        position: relative;

        a{
          width: 40px;
          /*min-width: 42px;*/
          height: 40px;
          /*min-height: 42px;*/
          margin-right: 3px;
        }

        .delete {
          position: absolute;
          right: 5px;
          top: 32px;
          /*没用*/
          /*border-radius: 50%;*/
          width: 18px;
          height: 18px;
          line-height: 18px;
          text-align: center;
          /*transition: transform 0.3s;*/
          transform: scale(0);
          /*el-tooltip最终渲染为i标签*/
          i {
            margin: 0;
          }

          i:hover {
            color: #FF3255 !important;
          }
        }
      }

      .chat-conversation-li-center {
        /*妈蛋，如果内容扩大会变宽的*/
        /*min-width: 100px;*/
        width: 90px;
        font-size: 12px;
        margin-right:5px;

        p {
          margin-bottom: 5px;
        }

        p:nth-of-type(2) {
          font-size: 10px;
        }
      }

      .chat-conversation-li-right {
        /*min-width: 36px;*/
        width: 45px;
        font-size: 10px;
        text-align: right;
        p {
          margin-bottom: 5px;
        }
      }

      .chat-conversation-li:hover, .chat-conversation-li.active {
        background-color: rgba(255, 255, 255, 0.2);
      }

      .chat-conversation-li:hover .delete {
        transform: scale(1);
      }

      .chat-content-box {
        width: 76%;
        /*min-width: 515.2px;*/
        box-sizing: border-box;
      }
    }

    /deep/ .chat-setting {
      position: absolute;
      right: 0;
      top: 0;
      width: 250px;
      height: 100%;
      background-color: #f5f5f5;
      transition: transform 0.3s;
      transform: translateX(100%);
      z-index: 2005;
      border-radius: 5px 2px 0 5px;
      box-shadow: -1px 0 5px #bdafaf;
      overflow-y: auto;
      overflow-x: hidden;
      color: #111;

      h3 {
        height: 36px;
        line-height: 36px;
        color: #111;
        background-color: #eef5eb;
      }

      h5 {
        text-align: left;
        margin: 5px 5px 10px 5px;
        border-bottom: 1px solid #d5d5d5;
        padding-bottom: 5px;
      }

      .deClose {
        position: absolute;
        right: 5px;
        top: 5px;
        opacity: 0.7;
      }

      .deClose:hover {
        opacity: 1;
      }

      .bg {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        box-sizing: border-box;

        li.bg-li {
          width: 115px;
          height: 70px;
          background-color: #fff;
          border-radius: 2px;
          box-shadow: 0 0 1px #bdafaf;
          font-size: 14px;
          line-height: 70px;
          color: #fff;
          position: relative;
          margin: 4px;

          p {
            background-color: rgba(0, 0, 0, 0.2);
          }

          i {
            position: absolute;
            right: 0;
            top: 0;
          }
        }

        li.upload-btn {
          color: #28828f;
          position: relative;
          /*没有设置宽度*/
          height: 24px;
          margin-left: 5px;
          margin-bottom: 5px;
          /*移动到按钮的位置，然后让它透明*/
          input {
            width: 100%;
            height: 100%;
            /*不设置这个的话，是不会继承父元素被撑开的宽度的*/
            /*为什么不直接固定w，然后随便继承呢*/
            position: absolute;
            left: 0;
            top: 0;
            opacity: 0;
            z-index: 2;
          }
        }
      }

      .isColor-container {
        font-size: 12px;
        text-align: left;
        display: flex;
        justify-content: flex-start;
        align-content: center;
        line-height: 24px;
        padding-left: 5px;
        box-sizing: border-box;
        margin-bottom: 10px;

        .isColor {
          width: 150px;
          height: 24px;
          display: inline-block;
          border: 1px solid #d5d5d5;
          margin-left: 10px;
          color: #323232;
          text-align: center;
        }
      }

      .color-container {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        padding-left: 5px;
        box-sizing: border-box;
      }
    }

    /deep/ .chat-setting.active {
      transform: translateX(0);
    }
  }
</style>
