import axios from 'axios';
import router from '../router';
//主页的axios实例
let instance = axios.create({
  // 这个似乎没什么用啊，因为都用了/v进行代理了啊
    baseURL: '/'
});
// http request 请求拦截器，有token值则配置上token值
/*axios.interceptors.request.use(
 config => {
 if (token) {  // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求的header都加上token，不用每次请求都手动添加了
 config.headers.Authorization = token;
 }
 return config;
 },
 err => {
 return Promise.reject(err);
 });*/
// 401表示未经授权
// http response 服务器响应拦截器，这里拦截401错误，并重新跳入登页重新获取token
instance.interceptors.response.use(
    response => { // 拦截未登录
      // app.js那里拦截的
        if (response.data.status === 0) {
          // 通过router跳转
            router.replace('/');
        }
        return response;
    },
    // 这个似乎要返回的是error才会到这里
    error => {
      console.log('这里是error');
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 这里写清除token的代码
                    console.log('这里是401');
                    router.replace('/');
            }
        }
        return Promise.reject(error.response.data)
    });

export default {
    get(url, params) {
        return new Promise((resolve, reject) => {
            //r是结果，其实也可以return掉instance。get，让外面用。then
            // 这里弄成r.data那callback就可以直接处理返回的数据了
            instance.get(url, {params}).then(r => {
                resolve(r.data);
            })
        })
    },
    post(url, params) {
        return new Promise((resolve, reject) => {
            instance.post(url, params).then(r => {
                resolve(r.data);
            })
        })
    }
}
