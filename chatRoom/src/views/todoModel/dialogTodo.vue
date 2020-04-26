<template>
  <el-dialog :title="logTitle" :visible.sync="dialogVisible" @close="close">
    <el-form :model="todoForm" ref="todoForm">
      <el-form-item label="活动主题" label-width="100px" prop="title" :rules="[{ required: true, message: '主题不能为空'}]">
        <el-input v-model="todoForm.title"></el-input>
      </el-form-item>
      <el-form-item label="活动内容" label-width="100px" prop="content" :rules="[{ required: true, message: '内容不能为空'}]">
        <el-input type="textarea" v-model="todoForm.content" resize="none"></el-input>
      </el-form-item>
      <!--为什么对地点的reset总是不起作用，因为reset只能对有prop属性的发挥作用-->
      <el-form-item label="活动地点" label-width="100px" prop="address">
        <el-input v-model="todoForm.address"></el-input>
      </el-form-item>
      <el-form-item label="开始时间" label-width="100px">
        <el-date-picker
          v-model="todoForm.start"
          type="datetime"
          placeholder="选择日期时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" label-width="100px">
        <el-date-picker
          v-model="todoForm.end"
          type="datetime"
          placeholder="选择日期时间">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" @click="sure">
        <v-icon class="el-icon-loading" color="#fff" :size="14" v-if="loading"></v-icon>
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import api from '@/network';

  export default {
    name: 'dialogTodo',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      date: {
        default: new Date()
      },
      info: {
        type: Object,
        default: function () {
          return {};
        }
      }
    },
    data() {
      return {
        logTitle: '新建活动',
        todoForm: {
          title: '',
          start: '',
          end: '',
          address: '',
          content: ''
        },
        //给el-dialog用，不过为什么不直接用visible,我改下发现没问题
        //直接用visible，cons报错
        dialogVisible: false,
        loading: false // 保存中
      }
    },
    watch: {
      visible(f) {
        this.dialogVisible = f;
      },
      date(date) {
        this.todoForm.start = date['_d'].getTime();
        this.todoForm.end = date['_d'].getTime() + 1000 * 60 * 60 * 24 - 1000;
      },
      info(info) {
        //如果有title，有资料说明是编辑
        if (info.title) {
          this.logTitle = '编辑活动';
          Object.keys(this.todoForm).forEach(k => {
            this.todoForm[k] = info[k];
          });
          this.todoForm['_id'] = info['_id'];
        } else {
          this.logTitle = '新建活动';
        }
      }
    },
    methods: {
      close() {
        this.$refs['todoForm'].resetFields();
        this.$emit('close');
      },
      cancel() {
        // console.log(this.info)
        // this.$refs['todoForm'].resetFields();
        this.$emit('close');
      },
      sure() {
        this.$refs['todoForm'].validate((valid) => {
          if (valid && this.loading === false) {
            this.loading = true;
            //更新
            if (this.info.title) {
              //转化为json对象
              this.upTodo(JSON.parse(JSON.stringify(this.todoForm)));
            //  添加
            } else {
              this.addTodo(JSON.parse(JSON.stringify(this.todoForm)));
            }
          } else {
            return false;
          }
        });
      },
      addTodo(o) {
        api.addTodo(o).then(r => {
          this.loading = false;
          if (r.code === 0) {
            this.$refs['todoForm'].resetFields();
            this.$emit('sure', o);
            this.$message({
              message: '新建成功',
              type: 'success'
            });
          } else {
            this.$message({
              message: '新建失败',
              type: 'warning'
            });
          }
        });
      },
      upTodo(o) {
        api.upTodo(o).then(r => {
          this.loading = false;
          if (r.code === 0) {
            this.$refs['todoForm'].resetFields();
            //返回去更新界面的显示
            this.$emit('up', o);
            this.$message({
              message: '修改成功',
              type: 'success'
            });
          } else {
            this.$message({
              message: '修改失败',
              type: 'warning'
            });
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
