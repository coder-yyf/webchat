import Vue from 'vue';
import Router from 'vue-router';
import _import from './_import';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: _import('login')
    },
    {
      path: '/main',
      name: 'main',
      component: _import('mainModel/main'),
      redirect: 'main/personalMain',
      children: [
        {
          path: 'personalMain',
          name: 'personalMain',
          component: _import('mainModel/personalModel/personalMain'),
          redirect: 'personalMain/friendly',
          children: [
            {
              path: 'group',
              name: 'group',
              component: _import('mainModel/personalModel/group'),
              redirect: 'group/own',
              children: [
                {
                  path: 'set',
                  name: 'setGroup',
                  component: _import('mainModel/personalModel/groupModel/setGroup')
                },
                {
                  path: 'own',
                  name: 'ownGroup',
                  component: _import('mainModel/personalModel/groupModel/ownGroup')
                },
                {
                  path: 'search',
                  name: 'searchGroup',
                  component: _import('mainModel/personalModel/groupModel/searchGroup')
                },
                {
                  path: 'detail/:id',
                  name: 'groupDetail',
                  component: _import('mainModel/personalModel/groupModel/groupDetail')
                },
                {
                  path: 'apply/:id',
                  name: 'applyGroup',
                  component: _import('mainModel/personalModel/groupModel/applyGroup')
                },
                {
                  path: 'send',
                  name: 'sendGroupValidate',
                  component: _import('mainModel/personalModel/sendValidateSuccess')
                }
              ]
            },
            {
              path: 'friendly',
              name: 'friendly',
              component: _import('mainModel/personalModel/friendly'),
              redirect: 'friendly/own',
              children: [
                {
                  path: 'own',
                  name: 'ownFriend',
                  component: _import('mainModel/personalModel/friendModel/myFriend')
                },
                {
                  path: 'detail/:id',
                  name: 'friendDetail',
                  component: _import('mainModel/personalModel/friendModel/friendDetail')
                },
                {
                  path: 'apply',
                  name: 'applyFriend',
                  component: _import('mainModel/personalModel/friendModel/applyFriend')
                },
                {
                  path: 'search',
                  name: 'searchFriend',
                  component: _import('mainModel/personalModel/friendModel/searchFriend')
                },
                {
                  path: 'send',
                  name: 'sendFriendValidate',
                  component: _import('mainModel/personalModel/sendValidateSuccess')
                },
                {
                  path: 'wall/:id',
                  name: 'photoWall',
                  component: _import('mainModel/personalModel/friendModel/photoWall')
                }
              ]
            }
          ]
        },
        {
          path: 'application',
          name: 'application',
          component: _import('mainModel/applicationModel/application'),
          redirect: 'application/space',
          meta: {
            title: '应用空间',
            name: 'appSpace'
          },
          children: [
            {
              path: 'space',
              name: 'appSpace',
              component: _import('mainModel/applicationModel/appSpace'),
            },
            {
              path: 'videoGallery',
              name: 'videoGallery',
              component: _import('mainModel/applicationModel/videoGallery'),
              meta: {
                title: '看电视',
                name: 'videoGallery'
              }
            },
            {
              path: 'games',
              name: 'games',
              component: _import('mainModel/applicationModel/games/games'),
              meta: {
                title: '玩游戏',
                name: 'games'
              }
            },
            {
              path: 'news',
              name: 'news',
              component: _import('mainModel/applicationModel/news/news'),
              meta: {
                title: '看新闻',
                name: 'news'
              }
            },
            {
              path: 'newsDetailSub',
              name: 'newsDetail',
              component: _import('mainModel/applicationModel/news/newsDetail'),
              meta: {
                title: '新闻详情',
                name: 'newsDetail'
              }
            },
            {
              path: 'txzSub',
              name: 'txz',
              component: _import('mainModel/applicationModel/games/txz/txz'),
              meta: {
                title: '推箱子',
                name: 'txz'
              }
            }
          ]
        }
      ]
    },
    {
      path: '/todo',
      name: 'todo',
      component: _import('todoModel/todo')
    },
    {
      path: '/mySetting',
      name: 'mySetting',
      component: _import('mySettingModel/mySetting'),
      redirect: 'mySetting/means',
      children: [
        {
          path: 'means',
          name: 'means',
          component: _import('mySettingModel/settingModel/means')
        }
      ]
    },
    {
      path: '*',
      component: _import('notFound'),
    }
  ],
  //不加这个无法通过url访问别的页面
  mode:'history'
})
