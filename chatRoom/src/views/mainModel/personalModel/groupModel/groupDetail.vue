<template>
  <div class="vchat-Detail">
    <v-apheader back="-1" bgColor="transparent" class="vchat-Detail-header">
    </v-apheader>
    <el-carousel trigger="click" height="200px" arrow="never" indicator-position="none">
      <el-carousel-item v-for="item in 1" :key="item">
        <a class="DetailImage-a" :style="{backgroundImage: 'url('+IMG_URL+ groupInfo.img +')'}">
        </a>
      </el-carousel-item>
      <div class="DetailImage-bg">
        <p class="title">
          {{groupInfo.title}}
        </p>
        <p>
          webchat:{{groupInfo.code}}
        </p>
        <p>本群创建于{{createDate}}</p>
        <p>
          {{groupInfo.desc}}
        </p>
      </div>
    </el-carousel>
    <div class="vchat-Detail-container">
      <div class="group-users" v-if="applyFlag">
        <h3 class="group-users-title detail-item">
          <span>群聊成员</span>
          <p class="many">
            <span>共{{groupUsers.length}}人</span>
            <v-icon name="enter" color="#d5d5d5"></v-icon>
          </p>
        </h3>
        <ul class="group-users-liitte-list">
          <li v-for="(v, i) in groupUsers" :key="v.code" v-if="i < 9">
            <a class="vchat-photo">
              <img :src="IMG_URL + v.userId.photo" alt="">
            </a>
            <span class="vchat-line1">{{v.userId.nickname}}</span>
          </li>
        </ul>
      </div>
      <div class="group-managers detail-item" v-if="!applyFlag">
        <div>
          <span>管理员</span>
          <a v-for="(v, i) in managers" :key="v['_id']" class="vchat-photo" v-if="i < 3">
            <img :src="IMG_URL + v.userId.photo" alt="">
          </a>
        </div>
        <p class="many">
          <span>共{{managers.length}}人</span>
          <v-icon name="enter" color="#d5d5d5"></v-icon>
        </p>
      </div>

      <div class="detail-button">
        <button @click="apply" class="vchat-full-button minor" v-if="!applyFlag">申请加群</button>
        <button @click="destroy" class="vchat-full-button error" v-else-if="type===0">解散群聊</button>
        <button @click="quit" class="vchat-full-button error" v-else-if="type===1">退出群聊</button>
      </div>
    </div>
  </div>
</template>

<script>
  import vApheader from '@/components/content/header/vApheader';
  import api from '@/network';
  import utils from '@/common/utils';
  import {mapState} from 'vuex';

  export default {
    data() {
      return {
        groupInfo: {},
        groupUsers: [],
        //在config的dev.env那里可以看到
        IMG_URL: process.env.IMG_URL,
        managers: [],
        applyFlag: false, // 是否已加群
        holderId: '', // 群主id
        type: 0
      };
    },
    components: {
      vApheader
    },
    computed: {
      createDate() {
        return utils.formatDate(new Date(this.groupInfo.createDate));
      },
      ...mapState(['user'])
    },
    methods: {
      getGroupInfo() {
        let params = {
          groupId: this.$route.params.id
        };
        api.getGroupInfo(params).then(r => {
          if (r.code === 0) {
            this.groupInfo = r.data;
            this.groupUsers = r.users;
            this.applyFlag = this.groupUsers.filter(v => v.userName === this.user.name).length;
            this.managers = this.groupUsers.filter(v => v.holder === 1 || v.manager === 1);
            this.holderId = this.groupUsers.filter(v => v.holder === 1)[0].userId['_id'];
          }
        })
      },
      apply() {
        localStorage.group = JSON.stringify({
          groupName: this.groupInfo.title,
          groupId: this.$route.params.id,
          groupPhoto: this.groupInfo.img
        });
        this.$router.push({name: 'applyGroup', params: {id: this.holderId}});
      },
      quit() {
        this.$confirm('确认退出该群吗？', '确认信息')
          .then(() => {
              api.quitGroup({
                groupId: this.$route.params.id,
                userId: this.user.id
              }).then(r => {
                if (r.code === 0) {
                  api.removeConversitionList({id: this.$route.params.id}).then(r => {
                    this.$message({
                      type: 'success',
                      message: '退出成功'
                    });
                    if (r.code === 0) {
                      this.$socket.emit('leave',this.$route.params.id)
                      this.$store.commit('setConversationsList', Object.assign({}, {id: this.$route.params.id}, {d: true}));
                    }
                    this.$router.replace('/main/personalMain/group/own')
                    this.visible = false;
                  });
                } else {
                  this.$message({
                    type: 'warning',
                    message: '退出失败'
                  });
                }
              })
            }
          )
      },
      destroy() {
        this.$confirm('确认解散该群吗？', '确认信息')
          .then(() => {
            api.destroyGroup({groupId:this.$route.params.id}).then(r=>{
              if(r.code===0){
                this.$socket.emit('destroyGroupValidate',{groupId:this.$route.params.id})
                api.removeConversitionList({id: this.$route.params.id}).then(r => {
                  this.$message({
                    type: 'success',
                    message: '解散成功'
                  });
                  if (r.code === 0) {
                    this.$socket.emit('leave',this.$route.params.id)
                    this.$store.commit('setConversationsList', Object.assign({}, {id: this.$route.params.id}, {d: true}));
                  }
                  this.$router.replace('/main/personalMain/group/own')
                  this.visible = false;
                });
              }
              else{
                this.$message({
                  type: 'warning',
                  message: '解散失败'
                });
              }
            })
            }
          )
      }
    },
    sockets:{
      destroyGroupValidate(r){
        let params = {
          id: r
        };
        api.removeConversitionList(params).then(r => {
            if (r.code === 0) {
              this.$socket.emit('leave',{roomid:params.id})
              this.$store.commit('setConversationsList', Object.assign({}, params, {d: true}));
              this.$store.dispatch('getUserInfo');
            }
      });
      }
    },
    mounted() {
      //0是普通群成员，1是群主
      this.type = this.$route.params.type
      this.getGroupInfo();
    }
  }
</script>

<style lang="scss" scoped>
  @import "../vchatDetail";
</style>
