$(function () {
    'use strict';

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.request === 'summary') {
            fetchMovies(sendResponse);
        } else if (request.request === 'box_score') {
            fetchLiveFindFilm(sendResponse, request.mid);
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

    function fetchMovies(sendResponse) {
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            //TODO change to movies url, and make variables for today's date and zip
            url: 'http://data.tmsapi.com/v1.1/movies/showings?startDate=2017-03-18&zip=V6T2H7&api_key=ukuzkfkg2rwf5katynr8b5gd'
        }).done(function(data) {
            console.log(data);
            sendResponse(data);
        }).fail(function(xhr, textStatus, errorThrown) {
            console.log('Failed to fetch data.');
            sendResponse({failed :true});
        });
    }

    function fetchLiveFindFilm(sendResponse, mid) {
        $.ajax({
            type: 'GET',
            contentType:'application/json',
            //TODO change to movies url
            url: 'http://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2016/scores/gamedetail/' + mid + '_gamedetail.json'
        }).done(function(data){
            sendResponse(data);
        }).fail(function(xhr, textStatus, errorThrown) {
            console.log('Failed to fetch data.');
            sendResponse(null);
        });
    }
});