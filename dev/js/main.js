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
    el: '#app',
    data: {
        weatherItems: weatherStorage.fetch(),
        newWeatherItem: {}
    },

    watch: {
        weatherItems: {
            handler: function (weatherItems) {
                weatherStorage.save(weatherItems);
            },
            deep: true
        }
    },
    created: function () {
        if (this.weatherItems.length==0 || undefined){
            this.getLocation()
        }
    },
    methods: {

        addWeatherItem: function () {
            var value = this.newWeatherItem;
            if (!value) {
                return
            }
            this.weatherItems.push(this.newWeatherItem);
            this.newWeatherItem = {}
        },

        getLocation: function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.showPosition);
            } else {
                document.createElement('p').setAttribute('class', 'warning').innerHTML = "Geolocation is not supported by this browser.";
            }
        },
        showPosition: function (position) {
            var self = this;

            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            console.log(lat);
            console.log(lon);
            var APIUrl = 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon;
            var APIKey = '&appid=53c5355561ad2a2cd18efeac886352f3';
            var units = '&units=metric';
            var xhr = new XMLHttpRequest();
            xhr.open("GET", APIUrl + APIKey + units, true);
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
