<template>
  <div class="vchat-myFriend vchat-noUser">
    <v-apheader title="我的好友">
      <!--handlecommand是处理点击每一个项的，下面的command作为点击后的参数传入-->
      <el-dropdown trigger="click" @command="handleCommand">
        <v-icon cursor="pointer" name="hanbaobao" color="#fff"></v-icon>
        <el-dropdown-menu slot="dropdown">
          <!--          command点击后传给handleCommand-->
          <el-dropdown-item command="/main/personalMain/friendly/search">添加好友</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </v-apheader>
    <div class="vchat-myFriend-container">
      <div class="me-li" @click="goFriendDetail(user.id)">
        <a href="javascript:;">
          <img :src="IMG_URL + user.photo" alt="">
        </a>
        <div>
          <span class="vchat-line1" :title="user.nickname">{{user.nickname}}</span>
          <v-icon name="enter" color="#d5d5d5"></v-icon>
        </div>
      </div>
      <div class="vchat-linkman-container" :class="{active: showList.indexOf('mine') > -1}" v-if="friendList.length">
        <h3 @click="setShowList('mine')">
          <p>
            <v-icon name="fanhui" :size="16" color="#b7b6b6" class="list-icon"></v-icon>
            <span>我的好友</span>
          </p>
          <span>{{friendList.length}}</span>
        </h3>
        <ul class="vchat-linkman-list">
          <!--右键点击,设置x,y-->
          <li v-for="v in friendList" :key="v.id" @click="goFriendDetail(v.id,v.roomid)"
              @contextmenu="contextmenuClick($event, v)">
            <a href="javascript:;">
              <img :src="IMG_URL + v.photo" alt="">
            </a>
            <div>
              <p>
                <span class="vchat-line1" :title="v.nickname">{{v.nickname}}</span>
              </p>
              <p>
                <span :title="v.signature" class="vchat-line1">{{v.signature}}</span>
              </p>
            </div>
          </li>
        </ul>
      </div>
      <v-nodata v-else>
        <p class="vchat-no-have">
          还没有添加好友哦，去
          <router-link to="/main/personalMain/friendly/search">添加</router-link>
          吧。
        </p>
      </v-nodata>
    </div>
    <v-dropdown :command="currFriend" :x="x" :y="y" :visible="visible" @upVisible="upVisible">
      <!--      slot-scope插槽，这样才能将参数传给handleConverList，因为无法用：绑定数据-->
      <v-dropdown-item slot-scope="{command}" @dropdownClick="handleConversitionList(command)" slot="dropdown">
        {{addOrDel ? '从会话列表移除' : '添加到会话列表'}}
      </v-dropdown-item>
    </v-dropdown>
  </div>
</template>

<script>
  import vApheader from '@/components/content/header/vApheader';
  import {mapState} from 'vuex';
  import api from '@/network';

  export default {
    data() {
      return {
        friendList: [],
        IMG_URL: process.env.IMG_URL,
        showList: ['mine'], // 分组 备用
        visible: false, // dropdown显示
        currFriend: {},
        x: '', // dropdown left
        y: '' // dropdown top
      }
    },
    components: {
      vApheader
    },
    computed: {
      ...mapState(['conversationsList', 'user', 'removeSationId']),
      addOrDel() {
        return this.conversationsList.filter(v => v.id === this.currFriend.roomid).length;
      }
    },
    methods: {
      handleCommand(command) {
        this.$router.push(command);
      },
      goFriendDetail(id, roomid) {
        this.$router.push({name: 'friendDetail', params: {id: id, roomid: roomid}});
      },
      setShowList(v) {
        if (this.showList.indexOf(v) > -1) {
          this.showList.splice(this.showList.indexOf(v), 1);
        } else {
          this.showList.push(v);
        }
      },
      upVisible(f) {
        this.visible = f;
      },
      contextmenuClick(e, v) {
        //去掉默认行为以及阻止冒泡
        e.preventDefault();
        e.stopPropagation();
        this.currFriend = v;
        this.visible = true;
        this.x = e.clientX;
        this.y = e.clientY;
      },
      handleConversitionList(v) {
        if (!this.addOrDel) {
          this.addConversitionList(v);
        } else {
          this.removeConversitionList(v);
        }
      },
      addConversitionList(v) { // 加入会话列表
        let params = {
          name: v.nickname,
          photo: v.photo,
          id: v.roomid,
          type: 'friend'
        };
        api.addConversitionList(params).then(r => {
          if (r.code === 0) {
            this.$message({
              type: 'success',
              message: '添加成功'
            });
            this.$store.commit('setConversationsList', params);
          } else {
            this.$message({
              type: 'success',
              message: '添加失败'
            });
          }
          this.visible = false;
        });
      },
      removeConversitionList(v) {
        let params = {
          id: v.roomid
        };
        this.$socket.emit('leave', {roomid: v.roomid})
        api.removeConversitionList(params).then(r => {
          if (r.code === 0) {
            this.$message({
              type: 'success',
              message: '移除成功'
            });
            // console.log(typeof v.roomid,v.roomid)
            // this.removeSationId = v.roomid
            //没有反应，难道是vue版本问题
            this.$bus.$emit('a')
            this.$store.commit('setConversationsList', Object.assign({}, params, {d: true}));
          } else {
            this.$message({
              type: 'warning',
              message: '移除失败'
            });
          }
          this.visible = false;
        });
      },
      findMyfriends() {
        let params = {
          userId: this.user.id
        };
        api.findMyfriends(params).then(r => {
          if (r.code === 0) {
            //包含了id和roomid
            this.friendList = r.data;
            // console.log(this.friendList)
          }
        })
      }
    },
    mounted() {
      this.findMyfriends();
    }
  }
</script>

<style lang="scss" scoped>
  .vchat-myFriend {
    width: 100%;
    height: 100%;

    .vchat-myFriend-container {
      width: 100%;
      padding-top: 10px;
      height: calc(100% - 40px);
      overflow-y: auto;
      box-sizing: border-box;
    }

    .me-li {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 5px 15px 6px;
      box-sizing: border-box;
      margin-bottom: 5px;
      cursor: pointer;

      > a {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 10px;
        border: 1px solid #d5d5d5;
        box-sizing: border-box;

        img {
          width: 38px;
        }
      }

      > div {
        width: calc(100% - 52px);
        font-size: 14px;
        color: #a3a3a3;
        text-align: left;
        display: flex;
        justify-content: space-between;

        span {
          max-width: 160px;
        }
      }
    }

    .me-li:hover {
      background-color: #f5f5f5;
    }
  }
</style>
