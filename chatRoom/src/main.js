// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
//原来这里默认是index
import router from './router';
import 'babel-polyfill';
import store from './store';
import './api/fetch';
import VueLazyload from 'vue-lazyload'
import ElementUI from 'element-ui';
import '../static/css/element_ui.scss';
// import 'element-ui/lib/theme-chalk/index.css'
//引用socket.io
import VueSocketio from 'vue-socket.io';
import socketio from 'socket.io-client';
import libs from '@/libs'; // 引入全局插件
//这是全局声明吧
//原来什么v-img都是这里来的
//全局指令
import directives from './directives';

//定义自定义指令
//遍历对象
Object.keys(directives).forEach(k => Vue.directive(k, directives[k]));
//图片未加载或者加载错误时显示的图片
Vue.use(VueLazyload, {
    preLoad: 1,
    error: require('./assets/img/default.png'),
    loading: require('./assets/img/default.png')
});
//对那些插件组件进行安装
Vue.use(libs);
//设置服务器地址
Vue.use(VueSocketio, socketio(process.env.SOCKETIO));
Vue.use(ElementUI);
Vue.config.productionTip = false;


/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    components: {App},
    template: '<App/>'
});
