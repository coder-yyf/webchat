<template>
  <div class="vchat-videoGallery vchat-application">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="电视频道" name="1"></el-tab-pane>
    </el-tabs>
    <div class="videoGallery-content" v-loading="loading">
      <!--el的layout，span是占比-->
      <el-row class="tac">
        <!--span是占比-->
        <el-col :span="3" class="tac">
          <!--纵向-->
          <el-menu
            default-active="0"
            class="el-menu-vertical-demo"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#27c2bf"
            @select="selectMenu"
          >
            <!-- 频道栏-->
            <el-menu-item :index="i + ''" v-for="(v, i) in videoList" :key="i">
              <span slot="title">{{v.name}}</span>
            </el-menu-item>
          </el-menu>
        </el-col>
        <el-col :span="15">
          <div class="video-container">
            <dplayer :videoInfo="videoInfo"></dplayer>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import dplayer from '@/components/content/DPlayer/dplayer';

  export default {
    name: 'videoGallery',
    data() {
      return {
        //激活tab项
        activeName: '1',
        //激活频道项
        activeMenu: 0,
        loading: false,
        //cctv1,没用
        currVideo: 'http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8',
        videoList: [
          {
            name: 'CCTV-1', url: 'http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8'
          },
          {name: 'CCTV-2', url: 'http://ivi.bupt.edu.cn/hls/cctv2.m3u8'},
          {name: 'CCTV-3', url: 'http://ivi.bupt.edu.cn/hls/cctv3hd.m3u8'},
          {name: '广东卫视', url: 'http://ivi.bupt.edu.cn/hls/gdhd.m3u8'},
          {name: 'CHC高清电影 ', url: 'http://ivi.bupt.edu.cn/hls/chchd.m3u8'},
          {name: '北京卫视', url: 'http://ivi.bupt.edu.cn/hls/btv1hd.m3u8'},
          {name: '北京文艺', url: 'http://ivi.bupt.edu.cn/hls/btv2hd.m3u8'},
          {name: '湖南卫视', url: 'http://ivi.bupt.edu.cn/hls/hunanhd.m3u8'},
          {name: '浙江卫视', url: 'http://ivi.bupt.edu.cn/hls/zjhd.m3u8'},
          {name: '江苏卫视', url: 'http://ivi.bupt.edu.cn/hls/jshd.m3u8'},
          {name: '东方卫视', url: 'http://ivi.bupt.edu.cn/hls/dfhd.m3u8'},
          {name: '安徽卫视', url: 'http://ivi.bupt.edu.cn/hls/ahhd.m3u8'},
          {name: '黑龙江卫 ', url: 'http://ivi.bupt.edu.cn/hls/hljhd.m3u8'},
          {name: '辽宁卫视', url: 'http://ivi.bupt.edu.cn/hls/lnhd.m3u8'},
          {name: '深圳卫视', url: 'http://ivi.bupt.edu.cn/hls/szhd.m3u8'},
          {name: '天津卫视', url: 'http://ivi.bupt.edu.cn/hls/tjhd.m3u8'},
          {name: '湖北卫视', url: 'http://ivi.bupt.edu.cn/hls/hbhd.m3u8'},
          {name: '东南卫视', url: 'http://ivi.bupt.edu.cn/hls/sdhd.m3u8'},
          {name: '北京纪实', url: 'http://ivi.bupt.edu.cn/hls/btv11hd.m3u8'}
        ]
      }
    },
    computed: {
      videoInfo() {
        return {
          src: this.videoList[this.activeMenu].url,
          type: 'hls',
          autoplay: true
        }
      }
    },
    methods: {
      handleClick() {
      },
      selectMenu(index) {
        //转化为数字
        this.activeMenu = Number(index);
      }
    },
    components: {
      dplayer
    }
  }
</script>

<style lang="scss" scoped>
  .vchat-videoGallery {
    .videoGallery-content {
      /*减去tab栏*/
      height: calc(100% - 60px);
    }

    .tac {
      height: 100%;
      overflow-y: auto;
      /*滚动栏设置*/
      ::-webkit-scrollbar {
        width: 4px;
        background-color: #F5F5F5;
        border-radius: 10px;
      }
    }

    .video-container {
      width: 800px;
      margin-left: 20px;
    }
  }
</style>
