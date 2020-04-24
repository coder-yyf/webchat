/**
 * Created by wyw on 2018/8/4.
 */
//还可以直接引入文件夹，默认就是里面的index.js?
import api from '../api';
export default {
    getUserInfo({commit, state, dispatch}, that) { // 获取用户登录信息
        //这个用context代替不行吗
        api.getUserInfo().then(r => {
            //注意这里的r是json那个对象弄过来的，r。data才是用户数据
            if (r.code === 0) {
                commit('setUser', r.data);
                commit('setConversationsList', r.data.conversationsList);
                document.body.id = 'theme-' + r.data.projectTheme;
                dispatch('getVchatInfo');
                //传入that的是登录界面那里，判断有that的话就进入主页
                //没有that就不是进入主页，是单纯获得用户信息？
                //有that时登录那里，用这个进入主页
                if (that) {
                    that.loading = false;
                    that.$router.replace('/main/personalMain');
                }
            //  是App.vue那里用到,url进入时，如果没登陆，没有session，就是空的信息
            } else {
                commit('setUser', '');
            }
        });
    },
    setTransitionName({state}) { // 设置页面过渡动画类型
        state.transitionName = 'moveOut';
        setTimeout(_ => {
            state.transitionName = '';
        }, 500)
    },
    getVchatInfo({commit, state}) { // 获取官方账号信息
        api.getVchatInfo().then(r => {
            if (r.code === 0) {
                //对应用户的专门的Vchat，只不过添加了一个所谓的id，所有内容都是一样的，
              // 不过这个id就专门在conversationlist开了一个独特的房间，以后关于这个用户的通知都放到这个房间显示
                let id = state.user.id + '-' + r.data.id;
                state.Vchat = Object.assign({}, r.data, {type: 'vchat'}, {id},{name:'系统消息'});
                //加入到conversationlist中
                commit('setConversationsList', state.Vchat);
            }
        })
    }
}
