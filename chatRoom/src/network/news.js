import fetch from './fetch';

export default {
    getHotNews(type, page) { //获取头条
        return fetch.get(`touch/reconstruct/article/list/${type}/${page}.html`);
    }
}
