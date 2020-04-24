//简化引入,将路由懒加载写成这样
module.exports = path => () => import('@/views/' + path + '.vue');
//为什么这样子不行？
// module.exports = path =>import('@/views/' + path + '.vue');
// module.exports = path => r => require.ensure([], () => r(require('@/views/' + path + '.vue')));
