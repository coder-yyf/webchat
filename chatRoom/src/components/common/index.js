import noData from './nodata/noData.vue';
import Icon from './icon/Icon.vue';
import dropdown from './dropdown/dropdown.vue';
import dropdownItem from './dropdown/dropdownItem.vue';
import uploadPopover from './uploadPopover/uploadPopover.vue';
import PhotoSwipe from './PhotoSwipe/PhotoSwipe.vue';
//github上有，不过不是这么用，安装后应该可以Vue.compnent或者模仿下面这个，将组件require吧，例如
//let fullCalendar = require('vue-fullcalendar');，然后进行安装
let fullCalendar = require('./fullCalendar/fullCalendar');
//这样就可以用Vue.use，然后随便什么地方都可以用了
const install = {
    install:function(Vue){
        Vue.component('vNodata', noData);
        Vue.component('vIcon', Icon);
        Vue.component('vDropdown', dropdown);
        Vue.component('vDropdownItem', dropdownItem);
        Vue.component('vUploadPopover', uploadPopover);
        Vue.component('vPhotoSwipe', PhotoSwipe);
        Vue.component('full-calendar', fullCalendar.VueFullcalendar)
    }
};
export default install;
