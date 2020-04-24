<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'App',
    created() {
      //url进入的时候获取用户信息
      this.$store.dispatch('getUserInfo');
    },
    mounted() {
      // 离开页面和回到页面的效果
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
          document.title = '主人，你要离开了吗';
          clearInterval(this.t);
        } else {
          document.title = '哇，主人你回来啦';
          //this就是document对象
          // console.log(this)
          this.t = setTimeout(_ => {
            document.title = 'WebChat';
          }, 2000)
        }
      });
    }
  }
</script>

<style lang="scss">
  @import "../static/css/base";
  //引入主题
  @import "../static/theme/index";
</style>
