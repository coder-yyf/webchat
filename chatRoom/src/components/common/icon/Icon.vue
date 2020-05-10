<template>
  <!--数组绑定加对象绑定，牛逼-->
  <!--这里icon-xxx通过compute来弄好了，然后iconfont根据name有没有来决定加不加-->
  <!--el的小图标直接用class就行了-->
  <!--color，size那些是为了方便修改大小眼色，不用弄class-->
  <i :class="[{'iconfont': name}, 'vchat-noUser', className]"
     :style="{fontSize: size + 'px', color: color, cursor: cursor}" @click.stop="clickIcon"></i>
</template>
<script>
  export default {
    name: 'Icon',
    props: {
      name: {
        type: String,
        default: ''
      },
      size: {
        type: Number,
        default: 20
      },
      color: {
        type: String,
        default: '#5b5b5b'
      },
      cursor: {
        type: String,
        default: 'inherit'
      },
    },
    computed: {
      className() {
        return 'icon-' + this.name;
      }
    },
    data() {
      return {};
    },
    methods: {
      clickIcon() {
        this.$emit('clickIcon')
      }
    }
  }
</script>
<style lang="scss" scoped>
  i {
    display: inline-block;
  }
</style>
