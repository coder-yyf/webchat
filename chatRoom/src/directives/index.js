export default {
    //vue自定义指令
    watchMouse: { // v-watchMouse="flag"
        update: function (el, binding, vnode) {
            let watchMouse = (e) => {
                //点击非设置画面，或者f为false时，点击了溢出那里的设置画面
                if (!el.contains(e.target) || (el.contains(e.target) && !binding.value.f)) {
                    document.documentElement.removeEventListener('click', watchMouse);
                    binding.value.f = false;
                }
            };
            if (binding.value.f) {
                //为document添加这样一个点击事件
                document.documentElement.addEventListener('click', watchMouse)
            }
        }
    },
    bgColor: function (el, binding) { // v-bgColor="#ff6000"
        el.style.backgroundColor = binding.value;
    },
    fontColor: function (el, binding) {  // v-fontColor="#ff6000"
        el.style.color = binding.value;
    },
    opacity: function (el, binding) {  // v-opacity=0.2
        el.style.opacity = binding.value;
    },
    bgInmage: function (el, binding) { // v-bgInmage="1.jpg"
        el.style.backgroundImage = `url(${binding.value})`;
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
    },
    focus: function (el, binding) { // v-focus
        el.focus();
    }
}
