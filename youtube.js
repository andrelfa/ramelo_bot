const request = require('request');
const config = require("./auth.json");

const WATCH_VIDEO_URL = "https://www.youtube.com/watch?v=";

exports.watchVideoUrl = WATCH_VIDEO_URL;

exports.search = function search(searchKeywords, callback) {
    var requestUrl = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${config.api_key}`;

    request(requestUrl, (error, response) => {
        if (!error && response.statusCode == 200) {
            // console.log('request ----------', JSON.parse(response.body));
            var body = JSON.parse(response.body);
            if (body.items.length == 0) {
                console.log("Your search gave 0 results");
                return;
            }

            for (var item of body.items) {
                if (item.id.kind === 'youtube#video') {
                    callback(item.id.videoId, item.snippet.title);
                    return; // prevent adding entire list of youtube videos
                }
            }
        }
        else {
            console.log("Unexpected error when searching YouTube");
            return;
        }
    });

    return;
};