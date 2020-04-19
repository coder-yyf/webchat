/**
 * Created by wyw on 2018/8/4.
 */
export default {
    setUser(state, data) {
        //这是用户下线了？
        if (data === 'out') {
            state.user = {};
            return;
        }
        //本来就要改变state.user，干嘛要弄一个{}
        state.user = Object.assign({}, state.user, data);
    },
    setIslogin(state, data) {
        state.isLogin = data;
    },
    setConversationsList(state, data) { // 设置会话列表
        if (Array.isArray(data)) {
            state.conversationsList = data;
        } else {
            //这是在干嘛，传入不是数组类型例如对象来删除或添加会话列表？
          // 不是，这是看新产生的会话是已经在会话列表的还是不再，不在就是新的会话，添加进去
            let arr = state.conversationsList.filter(v => v.id === data.id);
            if (!arr.length) { // 添加
                state.conversationsList.push(data);
            } else {
                if (data.d) { // 移除
                    state.conversationsList = state.conversationsList.filter(v => v.id !== data.id);
                }
            }
        }
    },
    setOnlineUser(state, data) {
        state.OnlineUser = data;
    },
    setUnRead(state, data) {
        //清空当前对应roomid的未读数量
        if (data.clear) {
            //unRead里面不是单纯一个数字，而是对应会话编号弄相应的数量
            state.unRead.forEach(v => {
                if (v.roomid === data.roomid) {
                    v.count = 0;
                }
            });
            return;
        }
        //要修改的会话的unread已经在unread中有了
        let unRead = state.unRead.filter(v => v.roomid === data.roomid);
        if (unRead.length) {
            state.unRead.forEach(v => {
                if (v.roomid === data.roomid) {
                    if (data.add) {
                        v.count ++;
                    } else {
                        v.count = data.count;
                    }
                }
            });
        } else {
            state.unRead.push({roomid: data.roomid, count: data.count});
        }
    }
}
