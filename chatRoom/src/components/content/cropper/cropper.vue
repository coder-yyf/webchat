<template>
  <div class="vchat-crop-box">
    <div class="vchat-crop-container">
      <!--裁剪界面-->
      <div class="vchat-crop-left">
        <img :src="url" ref="avatar-image">
      </div>
      <!--裁剪后效果-->
      <div class="vchat-crop-right">
        <img :src="cropedUrl" alt="">
      </div>
    </div>
    <div class="vchat-crop-btn">
      <div class="choose-pic">
        <el-button size="small" type="primary">选择图片</el-button>
        <input type="file" @change="fileChange" ref="cropFile" accept="image/gif,image/jpeg,image/jpg,image/png">
      </div>
      <div>
        <el-button type="primary" @click="reset">重置</el-button>
        <el-button type="primary" @click="uploadImage">
<!--          加载效果-->
          <v-icon class="el-icon-loading" color="#fff" :size="14" v-if="loading"></v-icon>
          上传
        </el-button>
      </div>
    </div>
  </div>
</template>
<script>
  import Cropper from "cropperjs";
  import api from '@/network';

  export default {
    props: ['url'],
    data() {
      return {
        cropper: null,
        //裁剪后的url
        cropedUrl: '',
        //没用
        cropingUrl: '',
        loading: false
      };
    },
    watch: {
      url(url) {
        // mounted比这个早，所以没有效果，而且，url不是数据，会产生跨域问题
        //这个url变化只在一开始出现过一次
        if (this.cropper) {
          this.$refs['cropFile'].value = '';
          // 这样设置报错
          // this.$refs['cropFile'].value = url;
          //替换图片
          // 跨域问题
          this.cropper.replace(url);
        }
      }
    },
    methods: {
      initCropper() {
        this.cropper = new Cropper(this.$refs['avatar-image'], {
          viewMode: 1,
          //放大倍率
          aspectRatio: 1,
          crop: () => {
            //获取裁剪后的图片url，其实是base64，生成png格式
            this.cropedUrl = this.cropper.getCroppedCanvas().toDataURL('image/png');
          }
        });
      },
      reset() {
        this.cropper.reset();
      },
      fileChange(e) {
        console.log(this.$refs['cropFile'].value)
        let reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = (ev) => {
          //替换图片
          this.cropper.replace(ev.target.result);
        }
      },
      uploadImage() {
        let bytes = window.atob(this.cropedUrl.split(',')[1]); // 这里对base64串进行操作，去掉url头，并转换为byte
        let ab = new ArrayBuffer(bytes.length); // 处理异常，将ASCII码小于0的转换为大于0
        let ia = new Uint8Array(ab);
        for (let i = 0; i < bytes.length; i++) {
          ia[i] = bytes.charCodeAt(i);
        }
        this.loading = true;
        let blob = new Blob([ab], {type: 'image/png'}); // type为图片的格式
        let formdata = new FormData();
        //后面的作为originalname
        formdata.append('f', blob, 'f' + Date.now() + '.png');
        api.uploadFile(formdata).then(r => {
          if (r.code === 0) {
            //传给设置表单
            this.$emit('avatar', r.data);
          } else {
            this.$message({
              message: '保存失败',
              type: 'warning'
            })
          }
          this.loading = false;
        })
      }
    },
    mounted() {
      this.$nextTick(_ => {
        if (this.url) {
          this.initCropper();
        }
      });
    }
  }
</script>
<style lang="scss">
  .vchat-crop-box {
    width: 100%;

    .vchat-crop-container {
      width: 100%;
      height: 400px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      .vchat-crop-left {
        width: 400px;
        height: 400px;
        border: 1px solid #d5d5d5;
        overflow: hidden;
      }

      .vchat-crop-right {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        overflow: hidden;
        border: 1px solid #d5d5d5;

        img {
          border-radius: 50%;
          width: 100%;
        }
      }
    }

    .vchat-crop-btn {
      width: 100%;
      display: flex;
      justify-content: space-between;

      .choose-pic {
        position: relative;
        width: 80px;
        height: 32px;
        cursor: pointer;

        > input {
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          width: 80px;
          height: 32px;
        }
      }
    }
  }

  @import "../../../../static/css/cropper";
</style>
