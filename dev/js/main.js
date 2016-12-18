//Ключ хранилища
var STORAGE_KEY = 'weather-app';
//Хранение данных
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

//Опции для форматирования даты
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
        historyWeather: weatherStorage.fetch(), //получение данных из хранилища
        currentWeatherItem: null, //начальная инициализация дефолтного объекта
        newWeatherItem: {}, //пустой объект для сохранения нового города
        townName: '', //переменная для поля ввода
        lastUpdate: '', // переменная для хранения времени последнего обновления

        APIKey: '53c5355561ad2a2cd18efeac886352f3', //ключ к API
        units: '&units=metric', //система измерения
        delayTime: 600000, // 10 минут задержка
        showModal: false, //переменная для показа окна сообщения
        message:'' //сообщение для модального окна
    },

    //лежение за объектом со всеми данными и сохранение в хранилище
    watch: {
        historyWeather: {
            handler: function (weatherItems) {
                weatherStorage.save(weatherItems);
            },
            deep: true
        }
    },
    //вызов дефолной функции при загруке приложения
    created: function () {
        this.getLocation();

    },
    methods: {
        //геолокация
        getLocation: function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.getCurrentWeather);
            } else {
                document.createElement('p').setAttribute('class', 'warning').innerHTML = "Geolocation is not supported by this browser.";
            }
        },
        //проверка конца задержки
        checkDelay: function (weatherItem) {

            var currTime = Date.now(); //текущее время
            var d=weatherItem.lastUpdate; //время обновления погоды объекта

            return d + this.delayTime <= currTime;
        },

        //инфо о погоде в текущей геолокации
        getCurrentWeather: function (position) {
            var self = this;

            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            var APIUrl = 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + this.APIKey + this.units;

            //запрос
            var xhr = new XMLHttpRequest();
            xhr.open("GET", APIUrl, true);
            xhr.responseType = "json";
            xhr.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    self.currentWeatherItem = this.response; //записали объект
                    self.currentWeatherItem.lastUpdate = Date.now(); //присвоили время обновления
                }else if(this.status== 502 || this.status== 401){
                    self.errorOnTown(self, 'Нет такого города!');
                }
            };
            xhr.send();


        },
        // добавили в хранилище
        addWeatherItem: function () {
            var value = this.newWeatherItem;
            if (!value) {
                return
            }
            this.historyWeather.push(this.newWeatherItem);
            this.newWeatherItem = {};
        },
        // удалили из хранилища
        removeWeatherItem: function (weatherItem) {

            this.historyWeather.splice(this.historyWeather.indexOf(weatherItem), 1)
        },
        //обновили погоду
        updateWeatherItem: function (weatherItem) {
            if (this.checkDelay(weatherItem)){
                var self=this;
                var itemToUpdate = this.historyWeather[this.historyWeather.indexOf(weatherItem)]; //нашли в хранилище обновляемый объект

                var APIUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + weatherItem.name + '&appid=' + this.APIKey + this.units;
                var xhr = new XMLHttpRequest();
                xhr.open("GET", APIUrl, true);
                xhr.responseType = "json";
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        itemToUpdate.main.temp = this.response.main.temp; //обновили только температуру
                        itemToUpdate.lastUpdate = Date.now();
                    }else if(this.status== 502 || this.status== 401){
                        self.errorOnTown(self, 'Нет такого города!');
                    }
                };
                xhr.send();
            }else{
                this.showModal=true;
                this.errorOnTown(this, 'Прошло слишком мало времени!');

            }


        },
        //
        // showPosition: function (position) {
        //     var self = this;
        //
        //     var lat = position.coords.latitude;
        //     var lon = position.coords.longitude;
        //     console.log(lat);
        //     console.log(lon);
        //     var APIUrl = 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + this.APIKey + this.units;
        //     var xhr = new XMLHttpRequest();
        //     xhr.open("GET", APIUrl, true);
        //     xhr.responseType = "json";
        //     xhr.onreadystatechange = function () {
        //         if (this.readyState == 4 && this.status == 200) {
        //             self.newWeatherItem = this.response;
        //             self.addWeatherItem();
        //         }else{
        //             self.errorOnTown(self, 'Нет такого города!');
        //         }
        //     };
        //     xhr.send();
        // },
        //Поиск погоды по имени города
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
                }else if(this.status== 502 || this.status== 401){
                    self.errorOnTown(self, 'Нет такого города!');
                }
            };
            xhr.send();
        },
        errorOnTown:function (closure,message) {
            closure.showModal=true;
            closure.message= message;
        }
    },
    filters:{
        //перевод даты в человеческую форму
        readeableDate: function (value) {
            var tmp=new Date(value);
            return tmp.toLocaleString("ru", options);
        },
        //добавление знака градуос цельсия
        deg: function (value) {
            return value +'℃'
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

//компонент модального окна
Vue.component('modal',{
    props: ['message'],
    template: '#modal-template',
    viewed: false
});

app.$mount('#app');
