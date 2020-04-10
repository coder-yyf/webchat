<template>
  <!--？-->
  <!--<div class="vchat-login" v-bgInmage="bg">-->
  <!--这样默认图片没有用完全,其实就是cover，明明都是同一张图片为什么他可以做到，而我不可以-->
  <!--难道上面的东西是什么插件的效果?他也不是完整,难道是转化为base64的效果-->
  <!--<div class="vchat-login" :style="'backgroundImage:url('+bg+')'">-->
  <div class="vchat-login" v-bgInmage="bg">
    <!--<div class="fork-me-on-github">
      <a href="https://github.com/wuyawei" target="_blank"></a>
    </div>-->
    <div class="logo" :class="{active: showSign}">
      <h3 class="title">Welcome to WebChat !</h3>
      <span class="begain" @click="experience">立即体验</span>
    </div>
    <div class="sign" v-if="showSign">
      <div class="title">
        <span :class="{active: islogin}" @click="choose(true)">登录</span>
        <span :class="{active: !islogin}" @click="choose(false)">注册</span>
      </div>
      <!--label-width是前面文字label的宽度
      ：model是vue的双向绑定，就是v-model
      -->
      <!--ref索引吧，不止表单有，div啥的也可以用，rules是表单验证规则-->
      <el-form ref="signForm" label-width="80px" class="signForm" :rules="signRules" :model="signForm">
        <!--prop是放到校验规则中的-->
        <el-form-item prop="name">
          <el-input v-model="signForm.name" placeholder="账号">
            <i class="iconfont icon-zhanghao" slot="prepend"></i>
          </el-input>
        </el-form-item>

        <el-form-item prop="pass">
          <!--按下回车触发函数？-->
          <el-input v-model="signForm.pass" placeholder="密码" type="password" @keyup.enter.native="enter(islogin)">
            <i class="iconfont icon-mima3" slot="prepend"></i>
          </el-input>
        </el-form-item>

        <el-form-item prop="repass" v-if="!islogin">
          <!--type为pass就与掩盖啥的-->
          <el-input v-model="signForm.repass" placeholder="确认密码" type="password" @keyup.enter.native="enter(islogin)">
            <i class="iconfont icon-mima2" slot="prepend"></i>
          </el-input>
        </el-form-item>

        <el-form-item prop="regcode" class="regcode-box">
          <el-input v-model="signForm.regcode" placeholder="验证码" @keyup.enter.native="enter(islogin)">
            <i class="iconfont icon-mima3" slot="prepend"></i>
          </el-input>
          <!--给canvas留一个位置，ref可以通过js简单获取标签-->
          <canvas ref="regcode" width="90" height="38"></canvas>
        </el-form-item>

      </el-form>
      <button @click="enter(islogin)">
        <!--登录旁边的小加载符号-->
        <!--为什么不用i标签，而且size干嘛要绑定,这个v-icon在libs下面有封装-->
        <!--本质就是一个i标签，color，size都是参数-->
        <!--class是elmentui自带的所以i也行-->
        <v-icon class="el-icon-loading" color="#fff" :size="14" v-if="loading"></v-icon>
        <!--<i class="el-icon-loading" color="#fff" :size="14" v-if="loading"></i>-->
        {{islogin ? '登录' : '注册'}}
      </button>
      <div class="login-foot" v-if="islogin">
        <span></span>
        第三方登录
        <span></span>
      </div>
    </div>
  </div>
</template>

<script>
  import api from '../api';
  import Canvas from 'vchat-regcode';
  // import bg from '../assets/img/0076.jpg';
  import bg from '../assets/img/login-bg.jpg';

  export default {
    name: 'login',
    data() {
      //callback里面放提示信息
      let validateName = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入账号'));
        } else {
          let reg = /^[a-zA-Z0-9_]{2,8}$/;
          if (!reg.test(value)) {
            callback(new Error('请输入2~8位数字字母下划线'));
            //这个是用来干嘛的，为了不执行下面？
            return;
          }
          callback();
        }
      };
      let validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          let reg = /^[a-zA-Z0-9]{6,12}$/;
          if (!reg.test(value)) {
            callback(new Error('请输入6~12位数字字母组合'));
            return;
          }
          callback();
        }
      };
      let validateRePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入确认密码'));
        } else {
          //这个才是model的用处
          if (value !== this.signForm.pass) {
            callback(new Error('两次密码输入不一致'));
            return;
          }
          callback();
        }
      };
      let validateRegcode = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入验证码'));
        } else {
          if (value.toLowerCase() !== this.regcode.toLowerCase()) {
            this.regCodeClass.drawAgain();
            callback(new Error('验证码错误'));
            return;
          }
          callback();
        }
      };
      return {
        //初始值设置为空
        signForm: {
          name: '',
          pass: '',
          regcode: '',
          repass: ''
        },
        bg: bg,
        //这个到底用来干嘛的
        IMGURL: process.env.IMG_URL,
        islogin: true, // 登录 or 注册
        showSign: false, // 登录框显示
        regcode: '', // 验证码
        regCodeClass: null, // 验证码类
        signRules: {
          name: [
            {validator: validateName, trigger: 'blur'}
          ],
          pass: [
            {validator: validatePass, trigger: 'blur'}
          ],
          repass: [
            {validator: validateRePass, trigger: 'blur'}
          ],
          regcode: [
            {validator: validateRegcode, trigger: 'blur'}
          ]
        },
        //这个没用到
        signSuccess: { // 注册成功提示框
          code: '',
          Visible: false
        },
        loading: false
      }
    },
    //检测变量的变化
    watch: {
      islogin() {
        this.regCodeClass.drawAgain();
      },
      showSign() {
        if (this.showSign) {
          this.initRegcode();
        }
      }
    },
    methods: {
      initRegcode() {
        //Vue中dom的更新是异步的，应该是为了this.regcode用时候有regCodeClass
        //如果没有netxtTick的话，regCodeClass还是null
        this.$nextTick(() => {
          //其实querySelector也可以吧，弄个class
          //refs.regcode也可以
          this.regCodeClass = new Canvas(this.$refs['regcode'], {
            fontSize: 20,
            //验证码图片里面混入的线和点
            lineNum: 2,
            dotNum: 10
          });
          this.regCodeClass.draw((r) => {
            this.regcode = r;
          });
        })
      },
      choose(flag) {
        //重置掉ref为sighForm
        this.$refs['signForm'].resetFields();
        this.islogin = flag;
      },
      experience() {
        this.showSign = true;
      },
      enter(f) {
        //通过函数一口气检验
        this.$refs['signForm'].validate((valid) => {
          if (valid) {
            //成了看是登录还是注册
            if (f) {
              this.login();
            } else {
              this.signUp();
            }
          } else {
            return false;
          }
        });
      },
      login() {
        let params = {
          name: this.signForm.name,
          pass: this.signForm.pass
        };
        this.loading = true;
        api.login(params).then(r => {
          if (r.code === 0) {
            this.$message.success('登录成功');
            //r好像完全没用到嘛
            this.$store.dispatch('getUserInfo', this);
          } else if (r.code === -1) {
            this.$message.error('账号不存在或密码错误');
            this.loading = false;
          } else {
            this.$message.error('登录失败');
            this.loading = false;
          }
        });
      },
      signUp() {
        let params = {
          name: this.signForm.name,
          pass: this.signForm.pass
        };
        this.loading = true;
        api.signUp(params).then(r => {
          if (r.code === 0) {
            this.$refs['signForm'].resetFields();
            //这是elui的
            this.$notify({
              title: '注册成功',
              message: `您的WebChat号为：${r.data}，您可以凭此登录，祝您生活愉快！`,
              duration: 5000,
              type: 'success'
            });
            this.islogin = true;
          } else if (r.code === 1) {
            // elui的
            this.$message.error('账号已存在')
          } else {
            this.$message.error('注册失败')
          }
          this.loading = false;
        });
      },
      //这个没有用到啊
      handleClose(done) {
        this.islogin = true;
        done();
      }
    },
    mounted() {
      /*fetch('/api/getUser').then(res=>res.json()).then(r=>{
          if(r.code === 0){
              console.log(r);
          }
      });*/
      /*api.getUser().then(r => {console.log(r)});*/
    }
  }
</script>

<style scoped lang="scss">
  .vchat-login {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  /*.fork-me-on-github {
    width: 150px;
    height: 150px;
    background-image: url("../assets/img/github.png");
    position: absolute;
    right: 0;
    top: 0;
    background-size: contain;

    a {
      display: block;
      width: 150px;
      height: 150px;
    }
  }*/

  .logo {
    margin-top: 15%;
    transform: translateY(0%);
    transition: transform 0.5s;

    h3.title {
      font-size: 38px;
      color: #fff;
      text-align: center;
      font-weight: 400;
      margin-bottom: 20px;
    }

    span.begain {
      color: #fff;
      font-size: 20px;
      animation: fide 2s infinite;
      cursor: pointer;
    }

    span.begain:hover {
      opacity: 1;
      animation-play-state: paused;
      -webkit-animation-play-state: paused;
    }

    @keyframes fide {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.3;
      }
      100% {
        opacity: 1;
      }
    }
  }

  .logo.active {
    transform: translateY(-150%);
    /*<!--transform: translateY(-100%);-->*/
  }

  .sign {
    width: 350px;
    /*height: 370px;*/
    padding: 15px 25px 25px;
    background-color: #fff;
    border-radius: 10px;
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -175px;
    margin-top: -175px;
    animation: move 1.2s;
  }

  @keyframes move {
    0% {
      left: 0
    }
    40% {
      left: 50%;
    }
    40%, 100% {
      -webkit-transform: translate(0, 0);
    }
    50%,
    70%,
    90% {
      -webkit-transform: translate(-5px, -5px);
    }
    60%,
    80% {
      -webkit-transform: translate(5px, 5px);
    }
  }

  .sign .title {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
  }

  .sign .title span {
    width: 100px;
    border-right: 1px solid #d5d5d5;
    cursor: pointer;
  }

  .sign .title span:nth-of-type(2) {
    border-right: none;
  }

  .sign .title span.active {
    color: #1fbeca;
  }

  .sign button {
    width: 100%;
    border: none;
    outline: none;
    height: 36px;
    background-color: rgba(19, 164, 192, 0.82);
    color: #fff;
    border-radius: 25px;
    cursor: pointer;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  .sign button:hover {
    background-color: #1fbeca;
    color: #fff;
  }

  .login-foot {
    width: 100%;
    font-size: 12px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #d5d5d5;
  }

  .login-foot span {
    width: 100px;
    height: 1px;
    background-color: #d5d5d5;
    display: inline-block;
    margin: 0 10px;
  }

  .regcode-box {
    .el-input {
      width: 205px;
    }

    canvas {
      display: inline-block;
      vertical-align: middle;
    }
  }
</style>
<!--服了，在我自己写的那里又可以有动画，这里就没有，这里的有注释-->
<!--<style scoped lang="scss">
  .vchat-login{
    width:100%;
    height: 100%;
    /*没有这个的话,logo会溢出,飘上去,因为父子的上外边距重合*/
    overflow: hidden;
    position: relative;
    /*background-image: url("../assets/img/0076.jpg");
    background-size: cover;*/
  }
  .fork-me-on-github{
    width: 150px;
    height: 150px;
    background-image: url("../assets/img/github.png");
    position: absolute;
    right: 0;
    top:0;
    background-size: contain;
    a{
      display: block;
      width: 150px;
      height: 150px;
    }
  }
  .logo{
    margin-top: 15%;
    transform: translateY(0%);
    /*向上飘*/
    transition: transform 0.5s;
    h3.title{
      font-size: 38px;
      color: #fff;
      /*没用,原来这两个的居中是继承base的,看computed就知道了*/
      /*text-align: center;*/
      font-weight: 400;
      margin-bottom: 20px;
    }
    span.begin{
      color: #fff;
      font-size: 20px;
      animation: fide 2s infinite;
      cursor: pointer;
    }
    span.begin:hover{
      /*没用,还是保持动画停止时的状态*/
      opacity: 1;
      animation-play-state:paused;
      -webkit-animation-play-state:paused;
    }
    /*这个应该叫做fade才对*/
    @keyframes fide {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.3;
      }
      100% {
        opacity: 1;
      }
    }
  }
  .logo.active{
    /*本来是100%,看不完全的,这样子就很舒服了*/
    transform: translateY(-150%);
  }
  .sign{
    width: 350px;
    /*原本这里不设置,通过计算剧中的;现在如果这里不设置,根据公式,h的优先级比margin高
    这里最好不要设置，因为注册那里会添加一个，不适合固定高度*/
    /*height: 370px;*/
    padding: 15px 25px 25px;
    background-color: #fff;
    border-radius: 10px;
    box-sizing: border-box;
    position: absolute;
    left:50%;
    top:50%;
    margin-left: -175px;
    margin-top: -175px;
    /*这就舒服了,不用什么计算了,但是这样动画效果就出问题了,因为没有了margin-left的限制*/
    /*left:0;
    top: 0;
    bottom: 0;
    right: 0;
    margin: auto;*/
    animation: move 1.2s;
  }
  @keyframes move {
    0% {
      left: 0
    }
    40% {
      left: 50%;
    }
    40%, 100% {
      -webkit-transform: translate(0, 0);
    }
    50%,
    70%,
    90% {
      -webkit-transform: translate(-5px, -5px);
    }
    60%,
    80% {
      -webkit-transform: translate(5px, 5px);
    }
  }
  .sign .title{
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
  }
  .sign .title span{
    width:100px;
    border-right: 1px solid #d5d5d5;
    cursor: pointer;
  }
  .sign .title span:nth-of-type(2){
    border-right: none;
  }
  .sign .title span.active{
    color: #1fbeca;
  }
  .sign button{
    width:100%;
    border: none;
    outline: none;
    /*outline: red dotted thick;*/
    height: 36px;
    background-color: rgba(19, 164, 192, 0.82);
    color: #fff;
    border-radius: 25px;
    cursor: pointer;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  .sign button:hover{
    background-color: #1fbeca;
    color: #fff;
  }
  .login-foot{
    width:100%;
    font-size: 12px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #d5d5d5;
  }
  .login-foot span{
    width:100px;
    height: 1px;
    background-color: #d5d5d5;
    display: inline-block;
    margin: 0 10px;
  }
  .regcode-box{
    .el-input{
      width:205px;
    }
    canvas{
      display: inline-block;
      vertical-align: middle;
    }
  }
</style>-->
