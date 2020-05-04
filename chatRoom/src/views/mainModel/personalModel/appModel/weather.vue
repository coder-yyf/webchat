<template>
  <div class="vchat-weather vchat-bg">
    <div class="weather-container">
      <!--定位-->
      <div class="position">
        <v-icon name="coordinates_fill" color="#fff" :size="28"></v-icon>
        <p>{{cityName}}</p>
        <!--0是今天-->
        <span>{{getWeek(WeatherInfo[0].week)}}</span>
        <span>{{WeatherInfo[0].nightTemp}}℃ ~ {{WeatherInfo[0].dayTemp}}℃</span>
      </div>
      <ul class="weather-list">
        <!--今日实时-->
        <li>
          <p>发布时间：{{LiveWeather.reportTime}}</p>
          <p class="temperature">
            <span>{{LiveWeather.temperature}}</span>℃
            {{LiveWeather.weather}}
          </p>
          <!--<weather-icon :type="type"></weather-icon>-->
          <p>空气湿度：{{LiveWeather.humidity}}%</p>
          <p>风向：{{LiveWeather.windDirection}}； 风力：{{LiveWeather.windPower || '暂无'}}</p>
        </li>
        <!--明天，后天，大后天-->
        <template v-for="(v, i) in WeatherInfo">
          <!--除去第一天-->
          <li v-if="i > 0">
            <p>{{getWeek(v.week)}}</p>
            <p>{{v.date}}</p>
            <p>
              <!--2是拼音用于iconfont-->
              <v-icon :name="getWeatherType(v.dayWeather, '2')" color="#fff" :size="36"></v-icon>
            </p>
            <p>{{v.nightTemp}}℃ ~ {{v.dayTemp}}℃</p>
            <p>{{v.dayWeather}}</p>
            <p>风向：{{v.dayWindDir}}</p>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
  //高德api
  import AMap from 'AMap';
  import weatherIcon from './weather-icon.vue';
  import {mapState} from 'vuex';

  export default {
    data() {
      return {
        //预报
        WeatherInfo: [{}],
        //实时天气
        LiveWeather: {},
        type: 'sunny', // 天气类型
        cityName: ''
      }
    },
    components: {
      weatherIcon
    },
    computed: {
      ...mapState(['user'])
    },
    watch: {
      user: {
        handler(user) {
          if (user.city) {
            this.cityName = user.city.name === '市辖区' ? user.province.name : user.city.name;
            this.initWeather(this.cityName);
          }
        },
        immediate: true,
        deep: true
      }
    },
    methods: {
      initWeather(city) {
        let that = this;
        //这个就是首页用到的那个api啊
        AMap.plugin('AMap.Weather', function () {
          //创建天气查询实例
          let weather = new AMap.Weather();
          //执行实时天气信息查询
          weather.getLive(city, function (err, data) {
            that.LiveWeather = data;
            //修改type变量，切换动画
            that.getWeatherType(data.weather);
          });
          // 查询4天天气
          weather.getForecast(city, function (err, data) {
            that.WeatherInfo = data.forecasts;
          });
        });
      },
      getWeek(k) {
        return `星期${['一', '二', '三', '四', '五', '六', '日'][k - 1]}`;
      },
      //这里type表示1市英文，2是拼音
      getWeatherType(t, type = '1') {
        let reg1 = /多云|阴/;
        let reg2 = /雷/;
        let reg3 = /雨/;
        let reg4 = /晴/;
        let reg5 = /雪/;
        if (reg1.test(t)) {
          if (type === '1') {
            this.type = 'cloudy';
          } else {
            return 'yintian';
          }
        } else if (reg2.test(t)) {
          if (type === '1') {
            this.type = 'thunder-storm';
          } else {
            return 'leidian';
          }
        } else if (reg3.test(t)) {
          if (type === '1') {
            this.type = 'rainy';
          } else {
            return 'xiaoyu';
          }
        } else if (reg4.test(t)) {
          if (type === '1') {
            this.type = 'sunny';
          } else {
            return 'qing';
          }
        } else if (reg5.test(t)) {
          if (type === '1') {
            this.type = 'flurries';
          } else {
            return 'xue';
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .vchat-weather {
    width: 100%;
    height: 250px;
    background-image: url("../../../../assets/img/weather_b1.jpg");
    position: relative;
    border-radius: 5px 5px 0 0;
    overflow: hidden;

    .weather-container {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      text-align: left;
      color: #fff;
      padding: 10px;
      box-sizing: border-box;

      .position {
        margin-bottom: 10px;

        p {
          display: inline-block;
          margin-right: 10px;
        }

        span {
          font-size: 12px;
          margin-right: 5px;
        }
      }
    }

    .weather-list {
      color: #fff;
      font-size: 13px;
      display: flex;
      justify-content: flex-start;
      align-content: center;

      li {
        width: 200px;
        margin-right: 20px;
        text-align: center;

        .temperature {
          span {
            font-size: 30px;
            font-weight: 600;
          }
        }

        p {
          margin-bottom: 5px;
        }
      }
    }
  }

  .vchat-weather:before {
    display: block;
    content: '';
    position: absolute;
    background: linear-gradient(left top, rgba(22, 22, 22, 1), rgba(0, 0, 0, 0));
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
</style>
