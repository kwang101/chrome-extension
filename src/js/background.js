$(function () {
    'use strict';

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.request === 'find_movie') {
            fetchMovies(sendResponse, getDate(), getZip());
        } else if (request.request === 'wakeup') {
            sendResponse('woken');
        }
        return true;        // return true to tell google to use sendResponse asynchronously
    });

    // this will reload the background explicitly to trigger an update as soon as possible if available
    chrome.runtime.onUpdateAvailable.addListener(function(details){
        console.log("updating to version " + details.version);
        chrome.runtime.reload();
    });

    chrome.alarms.create('minuteAlarm', {
        delayInMinutes : 1,
        periodInMinutes : 1
    });

    function fetchMovies(sendResponse, date, zip) {
        $.ajax({
            type: 'GET',
            contentType:'application/json',
            url: 'http://data.tmsapi.com/v1.1/movies/showings?startDate=' + date + '&zip='+ zip + '&api_key=ukuzkfkg2rwf5katynr8b5gd'
        }).done(function(data){
            sendResponse(data);
        }).fail(function(xhr, textStatus, errorThrown) {
            console.log('Failed to fetch data.');
            sendResponse(null);
        });
    }

    function getDate() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        var date;

        if(dd<10) {
            dd='0'+dd
        } 

        if(mm<10) {
            mm='0'+mm
        } 

        today = mm+'-'+dd+'-'+yyyy;
        date = document.write(today);
        return date;
    }

    function getZip() {
        window.navigator.geolocation.getCurrentPosition(function(pos){
        console.log(pos);
        $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='+pos.coords.latitude+','+pos.coords.longitude+'&sensor=true')
        .then(function(res){
            console.log(res.data);
            return res.data;
        });
        })
    }
});