<template>
  <div class="vchat-main">
    <v-header></v-header>
    <div class="vchat-content">
      <div class="vchat-content-nav">
        <ul>
          <li v-for="v in nav" :key="v.id" :class="{active: $route.path.indexOf(v.link) > -1}">
            <router-link :to="{name: v.link}">
              <i class="iconfont" :class="[v.class]"></i>
              <p>{{v.name}}</p>
            </router-link>
          </li>
        </ul>
      </div>
      <div class="vchat-content-sub">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<!--关于多房间，socket可以同时加入多个房间但是也同时可以接收到多个房间的消息，需要自己处理数据-->
<!--所有用户都需要加入vchat房间 以发送系统消息（申请验证等）-->
<script>
  import utils from '@/utils/utils';
  import {mapState} from 'vuex';
  import vHeader from '@/views/components/header/vHeader';
  import api from '@/api';

  export default {
    data() {
      return {
        nav: [
          {
            name: '聊天主页',
            class: 'icon-daohangshouye',
            activeClass: 'icon-group_fill',
            id: 0,
            link: 'personalMain'
          },
          {
            name: '应用空间',
            class: 'icon-yingyong',
            activeClass: 'icon-people_fill',
            id: 1,
            link: 'application'
          }
        ]
      };
    },
    watch: {
      conversationsList: {
        handler(list) {
          // setTimeout(()=>{
            this.joinRoom()
          // },3000)
          /*if(this.conversationsList.length>this.listLen){
            this.$socket.emit('join',{roomid:list[list.length-1].id,name:this.user.name})
            this.listLen=this.conversationsList.length
          }*/
        },
        deep: true,
        immediate: true
      }
    },
    computed: {
      ...mapState(['user', 'conversationsList', 'Vchat'])
    },
    components: {
      vHeader
    },
    sockets: {
      //连接socket后自动返回这个
      connect: function (val) {
        console.log(this.$socket.id);
        console.log('连接成功');
      },
      customEmit: function (val) {
        console.log('连接失败');
      },
      joined(OnlineUser) {
        // console.log('这里是joined')
        // console.log('加入了', OnlineUser);
        this.$store.commit('setOnlineUser', OnlineUser)
      },
      /*leaved(OnlineUser) {
        console.log('这里是leaved')
        this.$store.commit('setOnlineUser', OnlineUser)
      },*/
      /*login(OnlineUser) {
        console.log('这里是login')
        // console.log('加入了', OnlineUser);
        this.$store.commit('setOnlineUser', OnlineUser)
      },*/
      logout(OnlineUser) {
        console.log('这里是logout')
        this.$store.commit('setOnlineUser', OnlineUser)
      },
      //注意这里并没有获得具体的100条消息，那个是在chat-item那里
      getHistoryMessages(mesdata) { // 获取未读消息数量
        //所有read的数组中不包含用户名的消息，也就是未读消息
        let data = mesdata.filter(v => v.read.indexOf(this.user.name) === -1);
        if (data.length) {
          this.$store.commit('setUnRead', {roomid: data[0].roomid, count: data.length});
        }
      },
      mes(r) { //更改未读消息数量
        this.$store.commit('setUnRead', {roomid: r.roomid, add: true, count: 1});
      },
      takeValidate(r) {
        this.$store.commit('setUnRead', {roomid: r.roomid, add: true, count: 1});
        if (r.type === 'info') {
          this.$store.dispatch('getUserInfo');
        }
      }
    },
    methods: {
      //这里写法太不好了，一有变化全部join一遍
      joinRoom() {
        if (!this.user.name) {
          return;
        }
        this.conversationsList.forEach(v => {
          let val = {
            name: this.user.name,
            time: utils.formatTime(new Date()),
            avatar: this.user.photo,
            roomid: v.id
          };
          let room = {roomid: v.id, offset: 1, limit: 200};
          this.$socket.emit('join', val);
          this.$socket.emit('getHistoryMessages', room);
        });
      }
    },
    mounted() {
      /*this.joinRoom()
      this.listLen = this.conversationsList.length*/
    }
  }
</script>

<style lang="scss" scoped>
  .vchat-main {
    width: 100%;
    height: 100%;

    .vchat-content {
      width: 100%;
      height: calc(100% - 80px);
      min-height: 600px;
      display: flex;
      justify-content: flex-start;
      background-color: #fff;

      .vchat-content-nav {
        width: 120px;
        height: 100%;

        ul {
          width: 100%;

          li {
            padding: 15px 0;
            cursor: pointer;

            a {
              display: block;
              text-decoration: none;

              i {
                font-size: 32px;
                margin-bottom: 5px;
              }

              p {
                font-size: 12px;
              }
            }
          }
        }
      }

      .vchat-content-sub {
        width: calc(100% - 120px);
        height: 100%;
        min-width: 1170px;
      }
    }
  }
</style>
