<template>
  <ul ref="msglist" class="vchat-message">
    <li style="fontSize: 12px" v-if="chatList.length > 50">更多消息请在聊天记录中查看</li>
    <!--用time做key，秒发时会有bug-->
    <li :class="[{org: v.type==='org'}]" v-for="(v, i) in chatList" :key="v.time">
      <!--template不渲染为任何标签，适合这种判断的-->
      <template v-if="v.type==='other'">
        <message-item type="other" @lookPhoto="lookPhoto" :v="v" class="other"></message-item>
      </template>
      <template v-if="v.type==='mine'">
        <message-item type="mine" @lookPhoto="lookPhoto" :v="v" class="mine"></message-item>
      </template>
      <template v-if="v.type==='org'">
        系统消息：<span>{{v.nickname}}</span>加入群聊！
      </template>
    </li>
  </ul>
</template>

<script>
  import messageItem from './messageItem.vue';

  export default {
    props: ['chatList'],
    name: 'vMessage',
    data() {
      return {
        IMG_URL: process.env.IMG_URL
      }
    },
    watch: {
      chatList() {
        this.$nextTick(_ => {
          setTimeout(_ => {
            //这样弄个加载的效果
            this.$emit('chatLoading');
            //一直都是0，不知道怎么用
            //这个应该是下拉到最新的那里，不过没产生效果
            this.$refs['msglist'].scrollTop = this.$refs['msglist'].scrollHeight + 200;
            // console.log(this.$refs['msglist'].scrollTop)
          }, 200);
        });
      }
    },
    components: {
      messageItem
    },
    methods: {
      lookPhoto(url) {
        this.$emit('lookPhoto', url);
      }
    }
  }
</script>

<style lang="scss" scoped>
  .vchat-message {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 5px 10px;
    box-sizing: border-box;
    position: relative;

    li {
      width: 100%;
      margin: 15px 0;
    }

    .org {
      width: 100%;
      margin: 20px 0;
      font-size: 12px;
      color: #e4e4e4;
      box-sizing: border-box;
    }

    .org span {
      color: rgb(164, 245, 231);
      margin: 0 5px;
    }
  }
</style>
