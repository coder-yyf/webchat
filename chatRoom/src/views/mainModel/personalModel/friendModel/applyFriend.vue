<template>
    <div class="vchat-apply">
        <v-apheader title="验证信息" back="-1">
            <!--<router-link :to="{name: 'sendGroupValidate'}">发送</router-link>-->
            <span @click="send">发送</span>
        </v-apheader>
        <el-form label-width="80px" class="introduceForm">
            <el-form-item label="个人介绍">
                <el-input v-model="introduce" placeholder="请输入不超过90个字" type="textarea" aotusize resize="none" :maxlength="90">
                </el-input>
            </el-form-item>
        </el-form>
        <i>{{introduce.length}}/90</i>
    </div>
</template>

<script>
    import api from '@/network';
    import vApheader from '@/components/content/header/vApheader';
    import { mapState } from 'vuex';
    import utils from '@/common/utils';
    export default{
        name: 'applyFriend',
        data() {
            return {
                introduce: ''
            }
        },
        computed: {
            ...mapState(['user', 'Vchat'])
        },
        components: {
            vApheader
        },
        methods: {
            send() {
                //通过localStorage来传递参数
                let friend = JSON.parse(localStorage.friend);
                let val = {
                    name: this.user.name,
                    mes: this.introduce,
                    time: utils.formatTime(new Date()),
                    avatar: this.user.photo,
                    nickname: this.user.nickname,
                    signature: this.user.signature,
                    read: [],
                    userM: this.user.id,
                    userY: this.$route.params.id,
                    userYname: friend.userYname,
                    userYphoto: friend.userYphoto,
                    userYloginName: friend.userYloginName,
                    //用于后面添加会话的
                    friendRoom : this.user.id + '-' + this.$route.params.id,
                    //给对面的官方添加消息用的
                    roomid: this.$route.params.id + '-' + this.Vchat.id.split('-')[1],
                    //是群相关的还是好友相关的
                    state: 'friend',
                    //验证类消息
                    type: 'validate',
                    //还没进行拒绝或同意
                    status: '0'
                };
                this.$socket.emit('sendValidate', val);
                this.$router.push({name: 'sendFriendValidate', query: {name: 'searchFriend'}});
            }
        },
        mounted() {
        }
    }
</script>

<style lang="scss" scoped>
    @import "../vchatDetail";
</style>
