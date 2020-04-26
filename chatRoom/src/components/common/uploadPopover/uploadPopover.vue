<template>
  <div class="uploadPopover">
    <el-popover
      placement="top"
      width="250"
      trigger="manual"
      v-model="visible">
      <el-upload
        class="upload-demo"
        ref="upload"
        action="/v/api/uploadFile"
        :file-list="fileList"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        name="f"
        :auto-upload="false">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">传输</el-button>
        <div slot="tip" class="el-upload__tip">文件大小不超过2M</div>
      </el-upload>
      <!--reference是触发的元素-->
      <span slot="reference">
        <slot></slot>
      </span>
    </el-popover>
  </div>
</template>

<script>
  export default {
    name: 'uploadPopover',
    props: ['visible'],
    data() {
      return {
        fileList: []
      };
    },
    methods: {
      submitUpload() {
        this.$refs.upload.submit();
      },
      //file是上传的文件，res是后端返回的数据
      handleSuccess(res, file) {
        this.$emit('handleSuccess', res, file);
        this.$refs.upload.clearFiles();
      },
      beforeUpload(file) {
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            this.$message.error('上传文件大小不能超过 2MB!');
        }
        return isLt2M;
        // 其实大小多少都无所谓
        // return true
      },
      handleError(err) {
        this.$message.error('文件上传失败!');
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
