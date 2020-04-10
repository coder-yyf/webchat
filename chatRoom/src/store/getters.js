/**
 * Created by wyw on 2018/8/4.
 */
export default {
    unReadCount(state) {
        let count = 0;
        //unRead中应该是每一个会话列表项中的count弄在一起
        state.unRead.forEach(v => {
            count += v.count;
        });
        return count;
    }
}
