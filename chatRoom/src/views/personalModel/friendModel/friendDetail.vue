<template>
  <div class="vchat-Detail">
    <v-apheader back="-1" bgColor="transparent" class="vchat-Detail-header">
      <v-icon name="erweima" color="#f5f5f5" cursor="pointer" @clickIcon="showFriendQr = true"></v-icon>
    </v-apheader>
    <!--走马灯-->
    <el-carousel trigger="click" height="200px" arrow="never"
                 :indicator-position="friendInfo.cover.length > 1 ? '' : 'none'" :autoplay="false">
      <el-carousel-item v-for="item in friendInfo.cover" :key="item">
        <a class="DetailImage-a" :style="{backgroundImage: 'url('+ IMG_URL + item +')'}">
          <!--<a class="DetailImage-a" :style="{backgroundImage: 'url(' + item +')'}">-->
        </a>
      </el-carousel-item>
      <div class="DetailImage-bg">
        <p class="title">
          {{friendInfo.nickname}}
        </p>
        <p>{{friendInfo.signature}}</p>
      </div>
    </el-carousel>
    <div class="vchat-Detail-container friend-detail-container">
      <a class="detail-avatar">
        <img :src="IMG_URL + friendInfo.photo" alt="">
      </a>
      <div class="firend-info">
        <p>
          Vchat：{{friendInfo.code}}
        </p>
        <p>
          性别：{{friendInfo.sex === '1' ? '男' : friendInfo.sex === '2' ? '女' : '保密'}}
        </p>
        <p>
          所在地：{{friendInfo.province.name + (friendInfo.city.name === '市辖区' ? '' : ' - ' + friendInfo.city.name) + ' - '
          + friendInfo.town.name}}
        </p>
      </div>
      <!--是用户本人-->
      <div class="detail-item" v-if="friendInfo.code === user.code" @click="toPhoto">
        <span>照片墙</span>
        <p>
          <v-icon name="enter" color="#d5d5d5"></v-icon>
        </p>
      </div>
      <div class="detail-button" v-if="friendInfo.code !== user.code">
        <button @click="apply" class="vchat-full-button minor" v-if="!myFriendFlag">加为好友</button>
        <button @click="remove" class="vchat-full-button error" v-else>删除好友</button>
      </div>
    </div>
    <div class="Qr-dialog" :class="{active: showFriendQr}">
      <v-icon class="el-icon-circle-close QrClose" @clickIcon="showFriendQr = false" color="#f5f5f5" :size="28"
              cursor="pointer"></v-icon>
    </div>
  </div>
</template>

<script>
  import vApheader from '@/views/components/header/vApheader';
  import api from '@/api';
  import utils from '@/utils/utils';
  import {mapState} from 'vuex';

  export default {
    data() {
      return {
        IMG_URL: process.env.IMG_URL,
        friendInfo: {cover: [], province: {}, city: {}, town: {}}, // user详情
        showFriendQr: false, // 二维码开关
        myFriendFlag: false // 是否为我的好友
      }
    },
    components: {
      vApheader
    },
    computed: {
      ...mapState(['user'])
    },
    sockets:{
      removeFriendValidate(r){
        console.log(r,'这里是removeValidate')
        let params = {
          id: r
        };
        api.removeConversitionList(params).then(r => {
          if (r.code === 0) {
            /*this.$message({
              type: 'success',
              message: '删除成功'
            });*/
            this.$socket.emit('leave',{roomid:params.id})
            this.$store.commit('setConversationsList', Object.assign({}, params, {d: true}));
          } /*else {
            this.$message({
              type: 'success',
              message: '删除失败'
            });
          }*/
          /*this.visible = false;*/
        });
      }
    },
    methods: {
      apply() {
        localStorage.friend = JSON.stringify({
          userYname: this.friendInfo.nickname,
          userYloginName: this.friendInfo.name,
          userYphoto: this.friendInfo.photo
        });
        this.$router.push({name: 'applyFriend', params: {id: this.$route.params.id}, query: {}});
      },
      remove() {
        this.$confirm('确认删除该好友吗吗？', '确认信息')
          .then(() => {
            /*let params = {
              friendRoomId: this.user.id + '-' + this.friendInfo.id,
              myRoomId: this.friendInfo.id + '-' + this.user.id
            }*/
            let params = {
              roomid: this.$route.params.roomid,
              myId:this.user.id,
              friendId:this.friendInfo.id
            };
            console.log('这里发起请求')
            api.removeFriend(params).then(r=>{
              if(r.code === 0){
                console.log('这里是回来了')
                this.$socket.emit('removeFriendValidate', params)
                api.removeConversitionList({id: this.$route.params.roomid}).then(r => {
                  /*if (r.code === 0) {
                    this.$message({
                      type: 'success',
                      message: '删除成功'
                    });
                    this.$store.commit('setConversationsList', Object.assign({}, {id: this.$route.params.roomid}, {d: true}));
                    this.$router.replace('/main/personalMain')
                  } else {
                    this.$message({
                      type: 'success',
                      message: '删除失败'
                    });
                  }*/
                  this.$message({
                    type: 'success',
                    message: '删除成功'
                  });
                  if (r.code === 0) {
                    this.$socket.emit('leave',params)
                    this.$store.commit('setConversationsList', Object.assign({}, {id: this.$route.params.roomid}, {d: true}));
                  }
                  this.$router.replace('/main/personalMain')
                  this.visible = false;
                });
              }
              else{
                console.log('看来还是没有0啊')
                this.$message({
                  type: 'success',
                  message: '删除失败'
                });
              }
            })

            // console.log(this.$route.params.roomid)
          })
      },
      getUserInfo() {
        let params = {
          id: this.$route.params.id
        };
        api.getUserInfo(params).then(r => {
          if (r.code === 0) {
            this.friendInfo = r.data;
          }
        })
      },
      toPhoto() {
        this.$router.push({name: 'photoWall', params: this.$route.params});
      },
      checkMyfriends() {
        let params = {
          userM: this.$route.params.id,
          userY: this.user.id
        };
        api.checkMyfriends(params).then(r => {
          if (r.code === 0) {
            this.myFriendFlag = r.data;
          }
        })
      }
    },
    created() {
      this.getUserInfo();
      this.checkMyfriends();
    }
  }
</script>

<style lang="scss" scoped>
  @import "../vchatDetail";
</style>
