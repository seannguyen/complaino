'use strict';

var app = angular.module('complainoApp');

app.factory('facebook', ['$q', '$rootScope', function ($q, $rootScope) {

    function init() {
        var deferred = $q.defer();
        //Facebook Config
        window.fbAsyncInit = function () {
            FB.init({
                appId: '151398355222659',
                xfbml: true,
                version: 'v2.5'
            });
            deferred.resolve();
        };

        (function (d, s, id) {
            var js,
                fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        })(document, 'script', 'facebook-jssdk');

        return deferred.promise;
    }

    function getLoginStatus() {
        var deferred = $q.defer();
        FB.getLoginStatus(function (response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    function logIn() {
        var deferred = $q.defer();
        FB.login(function (response) {
            deferred.resolve(response);
        }, { scope: 'email,user_likes,publish_actions,read_stream,user_friends' });
        return deferred.promise;
    }

    function updateRootUserByFacebookId(facebookId) {
        var deferred = $q.defer();
        //alr connected to facebook, let's check if there is any user in the databse or not
        User.get({ id: facebookId }).$promise.then(function (data) {
            $rootScope.user = data;
            deferred.resolve();
        }, function (error) {
            //cant find this fbID, must be new to the town, let's him join
            if (error.status !== 404) {
                deferred.resolve();
                return;
            }
            $q.all([getUserInfo(facebookId), getAvatar(facebookId)]).then(function (data) {
                var facebookUser = data[0];
                var avatarUrl = data[1];
                $rootScope.user = new User();
                $rootScope.user.facebookId = facebookId;
                $rootScope.user.name = facebookUser.name;
                $rootScope.user.avatarUrl = avatarUrl;
                return $rootScope.user.$save().$promise;
            }).then(function () {
                deferred.resolve();
            });
        });
        return deferred.promise;
    }

    function getUserInfo(userId) {
        var deferred = $q.defer();
        FB.api('/' + userId, function (response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    function post(message, link, tagIds) {
        var deferred = $q.defer();
        FB.api("/me/feed", "POST", {
            message: message,
            place: "1424132167909654", //this is our page id TODO: move this to config
            tags: tagIds,
            privacy: {
                value: "SELF"
            },
            link: link
        }, function (response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    function getAvatar(facebookId) {
        var deferred = $q.defer();
        FB.api("/" + facebookId + "/picture", { height: 200, width: 200 }, function (response) {
            if (response && !response.error) {
                deferred.resolve(response.data.url);
            } else {
                console.log("Get facebook avatar fail");
                deferred.reject();
            }
        });
        return deferred.promise;
    }

    return {
        init: init,
        getLoginStatus: getLoginStatus,
        getUserInfo: getUserInfo,
        logIn: logIn,
        post: post,
        getAvatar: getAvatar,
        updateRootUserByFacebookId: updateRootUserByFacebookId
    };
}]);
//# sourceMappingURL=facebook.js.map
