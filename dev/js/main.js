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

var app = new Vue({
    data: {
        historyWeather: weatherStorage.fetch(),
        currentWeatherItem: null,
        newWeatherItem: {},
        townName: '',
        APIKey: '&appid=53c5355561ad2a2cd18efeac886352f3',
        lastUpdate: '',
        units: '&units=metric'
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

        getCurrentWeather: function (position) {
            var self = this;

            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            console.log(lat);
            console.log(lon);
            var APIUrl = 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon;

            var units = '&units=metric';
            var xhr = new XMLHttpRequest();
            xhr.open("GET", APIUrl + this.APIKey + units, true);
            xhr.responseType = "json";
            xhr.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    self.currentWeatherItem = this.response;
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
            this.newWeatherItem = {}
        },

        showPosition: function (position) {
            var self = this;

            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            console.log(lat);
            console.log(lon);
            var APIUrl = 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", APIUrl + this.APIKey + this.units, true);
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

            var APIUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + this.townName + this.APIKey+this.units;
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
        }
    }
});

app.$mount('#app');
