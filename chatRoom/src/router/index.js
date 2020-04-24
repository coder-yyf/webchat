import router from './router';
//引入网页加载进度条
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './nprogress.scss';
// NProgress.inc(0.2);
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });

router.beforeEach((to, from, next) => {
    NProgress.start();
    next();
});

router.afterEach(() => {
    NProgress.done();
});
export default router;
