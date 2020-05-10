<template>
  <div :id="playerName" class="vchat-dplayer"></div>
</template>

<script>
  import 'dplayer/dist/DPlayer.min.css';
  import Hls from '../../../../node_modules/hls.js/dist/hls';
  import DPlayer from 'dplayer';

  export default {
    name: 'dplayer',
    props: ['videoInfo'],
    data() {
      return {
        dp: null,
        hls: null
      }
    },
    watch: {
      'videoInfo.src': { // 切换视频
        handler(src) {
          if (this.videoInfo.type === 'hls') {
            //如果存在先销毁
            if (this.hls) {
              this.hls.destroy();
            }
            //切换视频源
            this.dp.switchVideo({
              url: src,
              type: 'customHls',
              //没有用，不会自动播放，只有new时候其效果
              // autoplay: this.videoInfo.autoplay || false,
              customType: {
                'customHls': (video, player) => {
                  this.hls = new Hls();
                  this.hls.loadSource(video.src);
                  this.hls.attachMedia(video);
                }
              }
            });
            //换源后播放
            this.dp.play()
          }
        }
      }
    },
    beforeDestroy() { // 离开页面销毁播放器
      if (this.hls) {
        this.hls.destroy();
      }
      this.dp.destroy();
    },
    computed: {
      playerName() { // 随机id
        // return 'dplayer-' + Math.random();
        return 'dplayer-' + 'yyf';
      }
    },
    methods: {
      initHlsPlayer() {
        this.dp = new DPlayer({
          // 绑定元素
          container: document.getElementById(this.playerName),
          autoplay: this.videoInfo.autoplay || false,
          screenshot: false,
          video: {
            url: this.videoInfo.src,
            type: 'customHls',
            customType: {
              'customHls': (video, player) => {
                this.hls = new Hls();
                this.hls.loadSource(video.src);
                this.hls.attachMedia(video);
              }
            }
          }
        });
      }
    },
    mounted() {
      this.$nextTick(_ => {
        if (this.videoInfo.type === 'hls') {
          this.initHlsPlayer();
          this.dp.on('canplaythrough', () => {
            this.dp.play();
          });
        }
      })
    }
  }
</script>

<style lang="scss">
  .vchat-dplayer {
    width: 100%;
  }
</style>
