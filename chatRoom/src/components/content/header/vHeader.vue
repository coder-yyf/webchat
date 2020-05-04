<template>
  <div class="vchat-header">
    <div class="vchat-main-header" v-if="isMainHeader">
      <div class="vchat-header-container">
        <div class="vchat-logo">WebChat</div>
        <!--右边用户相关一栏-->
        <div class="vchat-mine">
          <!--noUser使得不能选中-->
          <nav class="vchat-noUser">
            <!--class="animated" :class="{bounceIn: hover}" @mouseover="mouseover" ref="showChat"-->
            <div>
              <!--超过99会显示99+，没有hidden的话，0也会显示出来-->
              <el-badge :value="unReadCount" :max="99" :hidden="unReadCount === 0" class="headerBadg">
                <span class="nav-btn">消息</span>
              </el-badge>
              <ul class="handleList">
                <!--显示会话列表与隐藏，为什么查看vchat消息那里，这样写会变为bug呢-->
                <li @click="showChat = !showChat"><span>聊天框</span></li>
                <li @click="reset"><span>聊天框复位</span></li>
              </ul>
            </div>
          </nav>
          <!--头像-->
          <div>
            <a href="javascript:;">
              <img :src="avatar" alt="">
            </a>
            <ul class="handleList">
              <!--这里key用错了，key用index是错误的-->
              <!--<li v-for="(v, i) in handleList" :key="i">-->
              <!--这里用对象作为key会报错，官方说不要用对象和数组-->
              <!--添加个id替代i更加合适-->
              <li v-for="(v, i) in handleList" :key="v.id">
                <!--因为点击会改变路由-->
                <router-link :to="v.link">
                  <!--这样子class就能够拼凑出iconfont需要的class啦-->
                  <i class="iconfont" :class="[v.icon ? v.icon : '']"></i>
                  {{v.name}}
                </router-link>
              </li>
            </ul>
          </div>
          <!--个性签名那里-->
          <div>
            <p>
              <!--span还有title属性的啊-->
              <!--注意这里的line1和2在static里是有样式的-->
              <span class="vchat-line1" :title="user.nickname">{{user.nickname}}</span>
              <span @click="loginOut" class="logout">[退出]</span>
            </p>
            <!--user.singnature不是默认就是这个人很懒吗-->
            <p class="vchat-line2" :title="user.signature">{{user.signature ? '个性签名：' + user.signature :
              '这个人很懒，暂时没有签名哦！'}}</p>
          </div>
        </div>
      </div>
      <!-- :parent="true"-->
      <transition name="chat">
        <!--handle时可以拖拽的部分，cancel则是不可以，没有写的好像也不可以-->
        <!--handles用来决定显示拉动的点-->
        <vue-draggable-resizable v-if="showChat"
                                 :w="w" :h="h"
                                 @resizestop = "onResizestop "
                                 @dragstop = "onDragstop"
                                 :minh="460" :minw="800"
                                 :handles = "['tl', 'tr', 'bl', 'br']"
                                 :draggable="draggable" :resizable="true"
                                 :x="x" :y="y" :z="2001"
                                 :drag-handle="'.chat-header, .chat-conversation-ul'"
                                 :drag-cancel="'a, .chat-conversation-li, .chat-handel, .vchat-scroll'"
        >
          <!--子传父，右边那个类似一个函数-->
          <chat @closeChat="showChat = false"></chat>
        </vue-draggable-resizable>
      </transition>
    </div>
    <!--这个是进入设置还有的顶部-->
    <div class="vchat-little-header" v-else>
      <div>
        <router-link to="/main/personalMain">WebChat</router-link>
        <!--通过router里面的每一个路由名字进行跳转-->
        <span class="logout" @click="$router.push({name: 'personalMain'})">[返回]</span>
      </div>
      <div class="avatar">
        <a href="javascipt:;">
          <img :src="avatar" alt="">
        </a>
        <span @click="loginOut" class="logout">[退出]</span>
      </div>
    </div>
  </div>
</template>

<script>
  import api from '@/network';
  import chat from '@/components/content/chat/vChat';
  import VueDraggableResizable from 'vue-draggable-resizable';
  import utils from '@/common/utils';
  //从store里面获得state和Getters
  import {mapState, mapGetters} from 'vuex';

  export default {
    name: 'vHeader',
    props: {
      isMainHeader: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
//                hover: false,
        draggable: true, // 允许拖拽
        handleList: [
          {
            name: '日程管理',
            icon: 'icon-huihuajilu',
            link: '/todo',
            id:1
          },
          {
            name: '个人设置',
            icon: 'icon-shezhi1',
            link: '/mySetting',
            id:2
          }
        ],
        //是否显示对话列表
        showChat: false,
        //localStorage默认类型是string
        //100，100，736这些是初始值
        //localStorage是一直都在的，刷新页面可以这样获得上次的值
        x: Number(window.localStorage.x) || 100,
        y: Number(window.localStorage.y) || 100,
        // w: Number(window.localStorage.w) || 736,
        w: Number(window.localStorage.w) || 800,
        h: Number(window.localStorage.h) || 460
      };
    },
    components: {
      chat,
      VueDraggableResizable
    },
    computed: {
      avatar() {
        return process.env.IMG_URL + this.$store.state.user.photo; // 用户头像avatar:
      },
      //这样获得了store里面的user和conversationsList和unReadCount，然后就可以直接用user，conversationList了
      ...mapState(['user', 'conversationsList']),
      // ...mapState(['user']),
      ...mapGetters(['unReadCount'])
    },
    watch: {
      //显示和退出的的时候，showChat会变化，这时候记录下这4个值
      showChat() {
        this.x = Number(window.localStorage.x) || 100;
        this.y = Number(window.localStorage.y) || 100;
        this.w = Number(window.localStorage.w) || 800;
        this.h = Number(window.localStorage.h) || 460;
      }
    },
    methods: {
      //不能马上就
      reset() {
        // console.log('点击了了reset')
        this.x = 100;
        this.y = 100;
        this.w = 800;
        this.h = 460;
        window.localStorage.w = 800;
        window.localStorage.h = 460;
        window.localStorage.x = 100;
        window.localStorage.y = 100;
        // console.log(window.localStorage.w,window.localStorage.h,window.localStorage.x,window.localStorage.y)
      },
      loginOut() {
        //销毁所有converlist的roomid
        this.leaveRoom();
        //发到后台去销毁session
        api.loginOut().then(r => {
          if (r.code === 0) {
            this.$message.success('退出成功');
            //将state中的user弄为{}
            this.$store.commit('setUser', 'out');
            this.$router.replace('/');
          }
        });
      },
      leaveRoom() {
        // 将所有的相关的roomid都销毁
        this.conversationsList.forEach(v => {
          let val = {
            name: this.user.name,
            time: utils.formatTime(new Date()),
            avatar: this.user.photo,
            roomid: v.id
          };
          //发送给服务器的socket出发leave事件
          this.$socket.emit('leave', val);
        });
        this.$socket.emit('disconnect','我来到disconnect了')
        this.$socket.emit('logout',{name:this.user.name})
      },
//            mouseover() {
//                this.hover = true;
//                this.$refs['showChat'].addEventListener('animationend', this.set, false);
//            },
//            set() {
//                this.hover = false;
//                this.$refs['showChat'].removeEventListener('animationend', this.set, false);
//            }
      onResizestop(x, y, w, h) {
        window.localStorage.w = w;
        window.localStorage.h = h;
      },
      onDragstop(x, y) {
        window.localStorage.x = x;
        window.localStorage.y = y;
      }
    }
  }
</script>
<style lang="scss">
  .vchat-header {
    .vchat-main-header {
      width: 100%;
      height: 80px;

      .vchat-header-container {
        width: 100%;
        height: 80px;
        display: flex;
        justify-content: space-between;
        /*辅轴上如何对齐*/
        align-items: center;
        /*不起作用*/
        /*position: relative;*/
        background-color: #28828f;
        /*z-index: 2002;*/
        z-index: 2000;
      }

      .vchat-logo {
        width: 120px;
        height: 80px;
        /*color: #fff;*/
        font-size: 28px;
        line-height: 80px;
      }

      .vchat-mine {
        display: flex;
        /*似乎没空白*/
        /*justify-content: flex-start;*/
        align-items: center;
        padding-right: 15px;

        > div:nth-of-type(1) {
          width: 80px;
          height: 70px;
          padding: 5px 10px;
          box-sizing: border-box;
          margin-right: 20px;
          border-radius: 2px;
          /*用来做什么*/
          /*为了让头像下方的list定位用的*/
          position: relative;
        }

        > div:nth-of-type(1) > a {
          display: block;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 50%;
          border: 1px solid #d5d5d5;
          cursor: default;

          img {
            width: 100%;
          }
        }

        > div:nth-of-type(1):hover {
          background-color: #f5f5f5;
        }

        .handleList {
          width: 128px;
          background-color: #fff;
          position: absolute;
          left: 0;
          top: 85px;
          display: none;
          z-index: 100;
          border-radius: 2px;
          /*box-shadow: 0 0 8px #d5d5d5;*/
          /*卡片效果*/
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
          padding: 10px 0;
          box-sizing: border-box;
        }

        .handleList:before {
          display: block;
          content: '';
          /*这个没了也没啥影响*/
          /*width: 0;
          height: 0;*/
          /*通过border绘制的三角形*/
          border-bottom: 15px solid #f2f2f2;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: none;
          position: absolute;
          left: 20px;
          top: -15px;
          z-index: 2;
        }

        /*不知道用来做什么的，删去也没变化*/
        .handleList:after {
          display: block;
          content: '';
          width: 100%;
          height: 15px;
          position: absolute;
          left: 0;
          top: -15px;
          z-index: 1;
        }

        .handleList li {
          width: 100%;
          line-height: 32px;
          font-size: 13px;
          text-align: left;
          padding: 0 20px;
          box-sizing: border-box;
          cursor: pointer;

          i {
            font-size: 16px;
            margin-right: 10px;
          }
        }

        /*然而并没有a标签*/
        .handleList li a {
          display: block;
        }

        /*hover显示*/
        > div:nth-of-type(1):hover .handleList {
          display: block;
        }

        > div:nth-of-type(2) {
          height: 50px;
          font-size: 16px;
          color: #fff;
          text-align: left;

          p:nth-of-type(1) {
            margin-bottom: 5px;
            padding-right: 10px;
            display: flex;
            align-items: center;

            span:nth-of-type(1) {
              max-width: 200px;
              display: inline-block;
            }

            span:nth-of-type(2) {
              margin-left: 10px;
              cursor: pointer;
              line-height: 1;
            }
          }

          p:nth-of-type(2) {
            font-size: 12px;
            max-width: 200px;
          }
        }

        nav {
          /*用来做啥子？*/
          /*display: flex;
          justify-content: flex-start;
          align-items: center;*/
          margin-right: 10px;
          height: 70px;
          line-height: 70px;
          box-sizing: border-box;

          > div {
            color: #fff;
            font-size: 16px;
            width: 80px;
            height: 100%;
            border-radius: 2px;
            /*这样handlelist就可以通过上面的用ab修改位置了*/
            position: relative;
          }
          /*好多重复样式*/
          > div:nth-of-type(1):hover .handleList {
            display: block;
          }

          .handleList {
            width: 120px;

            li {
              line-height: 32px;
              border-bottom: 1px solid #f5f5f5;
              font-size: 13px;
            }

            li:hover {
              color: #52d5d2;
            }
          }

          > div:hover {
            background-color: #f5f5f5;
            color: #323232;
          }

          > div:hover .nav-btn {
            color: #52d5d2;
          }
        }
      }

      /*这个到底用来干嘛的，删了也没变化*/
      .vdr {
        position: fixed;
        background-color: #fff;
        max-width: 1728px;
        max-height: 1080px;
        border-radius: 3px;

        .handle {
          width: 8px;
          height: 8px;
          background: #f5f5f5;
          border-radius: 2px;
        }
      }
    }

    .vchat-little-header {
      width: 100%;
      height: 40px;
      padding: 0 30px;
      text-align: left;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;

      > div {
        a {
          font-size: 20px;
          line-height: 40px;
          color: #fff;
        }

        span {
          margin-left: 10px;
          color: #fff;
          font-size: 12px;
        }
      }

      .avatar {
        display: flex;
        justify-content: flex-start;
        align-items: center;

        a {
          display: block;
          width: 32px;
          height: 32px;
          margin-right: 10px;
          border-radius: 50%;
          overflow: hidden;

          img {
            width: 100%;
          }
        }
      }

      span {
        cursor: pointer;
      }
    }
  }

</style>
