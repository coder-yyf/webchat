<template>
  <ul class="vchat-dropdown" :style="style" v-show="showFlag">
    <!--    作用域插槽-->
    <slot name="dropdown" :command="command"></slot>
  </ul>
</template>

<script>
  export default {
    props: ['x', 'y', 'visible', 'command'],
    data() {
      return {
        showFlag: false
      }
    },
    watch: {
      visible(f) {
        this.showFlag = f;
        if (this.showFlag) {
          //监听鼠标点击
          document.documentElement.addEventListener('mousedown', this.watchMouse);
        }
      }
    },
    computed: {
      //修改绝对定位位置
      style() {
        return {top: this.y + 'px', left: this.x + 'px'}
      }
    },
    methods: {
      // 监测鼠标事件，点击dropdown以外的元素隐藏
      watchMouse(e) {
        if (!this.$el.contains(e.target)) {
          this.showFlag = false;
          this.$emit('upVisible', false);
          //去掉监听
          document.documentElement.removeEventListener('mousedown', this.watchMouse);
        }
      }
    },
    mounted() {
      // 类似photoswipe添加一个内容
      document.querySelector('body').appendChild(this.$el);
    }
  }
</script>

<style lang="scss" scoped>
  .vchat-dropdown {
    position: absolute;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
    z-index: 100;
    padding: 10px 0;
    border-radius: 4px;
    background-color: #fff;
  }
</style>
