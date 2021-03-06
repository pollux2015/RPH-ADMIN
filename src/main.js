/**------------------------
 * Import Modules
 ------------------------*/
import Vue from 'vue';
import iView from 'iview';
import VueRouter from 'vue-router';
import Routers from './router';
import Vuex from 'vuex';
import App from './app.vue';
import store from './store/index';
import apis from './store/apis';
import lodash from './methods';
import VueHtml5Editor from 'vue-html5-editor';
import VueCookie from 'vue-cookie';
import VueCoreImageUpload from './components/avater.upload.vue';
import rules from './validateRules';

import BaiduMap from 'vue-baidu-map'
Vue.use(BaiduMap, {
  // ak 是在百度地图开发者平台申请的密钥 详见 http://lbsyun.baidu.com/apiconsole/key */
  ak: 'YOUR_APP_KEY'
})

// Install Global Module
Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(iView);
Vue.use(VueCookie);
Vue.use(apis);
Vue.use(lodash);
Vue.use(rules);

/**------------------------
 * Import Style
 ------------------------*/
import 'iview/dist/styles/iview.css';

/**------------------------
 * Global Components
 ------------------------*/
import AvaterView from './components/avater.perview';
import TxtView from './components/txt.perview';
import TableScoller from './components/table.scoller';
import MchoosePanel from './components/mchoose.panel';
import MchooseLocation from './components/mchoose.location';
import OrgMenus from './components/org.menus.vue';
import ProjectMenus from './components/project.menus.vue';
Vue.component('TableScoller', TableScoller);
Vue.component('AvaterView', AvaterView);
Vue.component('TxtView', TxtView);
Vue.component('MchoosePanel', MchoosePanel);
Vue.component('MchooseLocation', MchooseLocation);
Vue.component('OrgMenus', OrgMenus);
Vue.component('ProjectMenus', ProjectMenus);
Vue.component('VueCoreImageUpload', VueCoreImageUpload);

/**------------------------
 * Config Editor
 ------------------------*/
Vue.use(VueHtml5Editor, {
  name: 'vueEditor',
  showModuleName: true,
  icons: {
    text: 'ivu-icon ivu-icon-ios-color-filter',
    color: 'ivu-icon ivu-icon-android-color-palette',
    font: 'ivu-icon ivu-icon-social-tumblr',
    align: 'ivu-icon ivu-icon-navicon-round',
    link: 'ivu-icon ivu-icon-link',
    image: 'ivu-icon ivu-icon-image',
    'full-screen': 'ivu-icon ivu-icon-arrow-expand'
  },
  // 配置图片模块
  // config image module
  image: {
    // 文件最大体积，单位字节  max file size
    sizeLimit: 512 * 1024,
    // 上传参数,默认把图片转为base64而不上传
    // upload config,default null and convert image to base64
    upload: {
      url: store.getters.docUrl,
      // headers: {},
      params: {
        id: store.getters.orgId,
        type: 'org'
      },
      fieldName: 'file'
    },
    compress: null,
    // 响应数据处理,最终返回图片链接
    // handle response data，return image url
    uploadHandler(responseText) {
      const result = JSON.parse(responseText);
      if (result.code == 1) {
        return result.data.url;
      } else {
        iView.Message.error(result.msg || '上传失败');
      }
    }
  },
  language: 'zh-cn',
  visibleModules: [
    'text',
    'color',
    'font',
    'align',
    'link',
    'image',
    'full-screen'
  ]
})

/**------------------------
 * Config Router
 ------------------------*/
const router = new VueRouter({
  // mode: 'history',
  routes: Routers
});

const siteName = store.getters.siteName;

const isNeedAddTab = function(curTab) {
  if (curTab.meta.notab || curTab.params.noadd) {
    return false;
  } else if (curTab.meta.onetab) {
    const query = lodash.filter(store.getters.mainTabs, (tab) => {
      return curTab.name == tab.name;
    });
    return query.length <= 0;
  } else {
    return true;
  }
};

// 路由进入与退出
router.beforeEach((to, from, next) => {
  document.title = siteName + '-' + to.meta.title || siteName;
  iView.LoadingBar.start();
  next();
});

router.afterEach((to) => {
  store.commit('metaName', to.meta.title || siteName);
  store.commit('breadcrumb', []);
  const time = new Date().getTime();

  if (isNeedAddTab(to)) {
    store.commit('addMainTab', {
      name: to.name,
      meta: to.meta,
      random: parseInt(time * (Math.random())),
      title: to.meta.title,
      params: to.params,
      query: to.query
    });
  } else {
    const query = lodash.filter(store.getters.mainTabs, (tab) => {
      return to.name == tab.name;
    });
    if (query.length > 0 && query[0].name) {
      store.commit('activeTabByNoRandomName', query[0].name);
    }
  }
  iView.LoadingBar.finish();
  window.scrollTo(0, 0);
});

/**------------------------
 * New App
 ------------------------*/
// Vue.config.silent = true;
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
