<template>
  <div class="vchat-application-main">
    <!--进入应用里面才要面包屑-->
    <div class="back" v-if="$route.name !== 'appSpace'">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ name: v.meta.name }" v-for="(v, i) in breadcrumb" :key="i">{{v.meta.title}}
        </el-breadcrumb-item>
      </el-breadcrumb>
      <!--进入详情页才显示-->
      <span @click="$router.go(-1)" v-if="$route.path.indexOf('Sub') > -1">[返回上一页]</span>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    data() {
      return {}
    },
    computed: {
      breadcrumb() {
        //得到的是meta那里得东西
        return this.$route.matched.slice(1);
      }
    },
    mounted() {
    }
  }
</script>

<style lang="scss" scoped>
  .vchat-application-main {
    width: 100%;
    height: 100%;
    padding: 10px 15px 15px;
    box-sizing: border-box;
    overflow-y: auto;
    background-color: #f7f7f7;

    .back {
      display: flex;
      justify-content: flex-start;
      align-items: center;

      > span {
        margin-left: 25px;
        color: #1fbeca;
        font-size: 14px;
        cursor: pointer;
        opacity: 0.8;
        line-height: 14px;
      }

      > span:hover {
        opacity: 1;
      }
    }
  }
</style>
