var app = angular.module('lolvis', ['ionic', 'lolvis.services', 'lolvis.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/')

  $stateProvider.state('main', {
      url: '/',
      templateUrl: 'templates/main.html',
      controller: 'MainController'
  })
});

angular.module('lolvis.services', []);
angular.module('lolvis.controllers', []);
