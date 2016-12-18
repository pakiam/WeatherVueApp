var STORAGE_KEY = 'weather-app';

var weatherStorage = {
    fetch: function () {
        var weatherItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        weatherItems.forEach(function (weatherItem, index) {
            weatherItem.id = index;
        });
        weatherStorage.uid = weatherItems.length;
        return weatherItems;
    },
    save: function (weatherItems) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(weatherItems));
    }
};

var options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timezone: 'UTC',
    hour: 'numeric',
    minute: 'numeric'
};

var app = new Vue({
    data: {
        historyWeather: weatherStorage.fetch(),
        currentWeatherItem: null,
        newWeatherItem: {},
        tempWeatherItem: {},
        townName: '',
        lastUpdate: '',

        APIKey: '53c5355561ad2a2cd18efeac886352f3',
        units: '&units=metric',
        delayTime: 600000,
        showModal: false,
        message:''
    },

    watch: {
        historyWeather: {
            handler: function (weatherItems) {
                weatherStorage.save(weatherItems);
            },
            deep: true
        }
    },
    created: function () {
        // if (this.weatherItems.length==0 || undefined){
        this.getLocation()

    },
    methods: {

        getLocation: function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.getCurrentWeather);
            } else {
                document.createElement('p').setAttribute('class', 'warning').innerHTML = "Geolocation is not supported by this browser.";
            }
        },

        checkDelay: function (weatherItem) {

            var currTime = Date.now();
            var d=weatherItem.lastUpdate;

            console.log(currTime);
            console.log(this.delayTime);
            console.log(d + this.delayTime);
            console.log(d);
            console.log(d + this.delayTime <= currTime);

            return d + this.delayTime <= currTime;
        },

        getCurrentWeather: function (position) {
            var self = this;

            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            var APIUrl = 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + this.APIKey + this.units;

            var xhr = new XMLHttpRequest();
            xhr.open("GET", APIUrl, true);
            xhr.responseType = "json";
            xhr.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    self.currentWeatherItem = this.response;
                    self.currentWeatherItem.lastUpdate = Date.now();
                }
            };
            xhr.send();


        },

        addWeatherItem: function () {
            var value = this.newWeatherItem;
            if (!value) {
                return
            }
            this.historyWeather.push(this.newWeatherItem);
            this.newWeatherItem = {};
        },

        removeWeatherItem: function (weatherItem) {

            this.historyWeather.splice(this.historyWeather.indexOf(weatherItem), 1)
        },
        updateWeatherItem: function (weatherItem) {
            if (this.checkDelay(weatherItem)){
                var itemToUpdate = this.historyWeather[this.historyWeather.indexOf(weatherItem)];

                var APIUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + weatherItem.name + '&appid=' + this.APIKey + this.units;
                var xhr = new XMLHttpRequest();
                xhr.open("GET", APIUrl, true);
                xhr.responseType = "json";
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        itemToUpdate.main.temp = this.response.main.temp;
                        itemToUpdate.lastUpdate = Date.now();
                    }
                };
                xhr.send();
            }else{
                this.showModal=true;
                this.message='Прошло слишком мало времени!';
                // alert('Прошло слишком мало времени!');
            }


        },
        showPosition: function (position) {
            var self = this;

            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            console.log(lat);
            console.log(lon);
            var APIUrl = 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + this.APIKey + this.units;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", APIUrl, true);
            xhr.responseType = "json";
            xhr.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    self.newWeatherItem = this.response;
                    self.addWeatherItem();
                }
            };
            xhr.send();
        },
        getWeatherByTownName: function () {
            var self = this;

            var APIUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + this.townName + '&appid=' + this.APIKey + this.units;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", APIUrl, true);
            xhr.responseType = "json";
            xhr.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    self.newWeatherItem = this.response;
                    self.newWeatherItem.lastUpdate = Date.now();
                    self.addWeatherItem();
                }
            };
            xhr.send();
        }
    },
    filters:{
        readeableDate: function (value) {
            var tmp=new Date(value);
            return tmp.toLocaleString("ru", options);
        }
    }
});

// Vue.component( 'time-checker',{
//     props: ['lastUpdate'],
//     template: '<span> {{ lastUpdate}} </span> ',
//     data:function () {
//         return{
//             lastUpdate: Date.now()
//         }
//     }
// });

Vue.component('modal',{
    props: ['message'],
    template: '#modal-template',
    viewed: false
});
app.$mount('#app');
