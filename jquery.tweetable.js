/*
 * tweetable 1.6.1 - jQuery twitter feed generator plugin
 *
 * Copyright (c) 2009 Philip Beel (http://www.theodin.co.uk/)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * With modifications from Philipp Robbel (http://www.robbel.com/) and Patrick DW (stackoverflow)
 * for IE compatibility.
 *
 * Revision: $Id: jquery.tweetable.js 2011-01-06 $
 *
 */
(function ($) {
    //define the tweetable plugin
    $.fn.tweetable = function (options) {
        //specify the plugins defauls
        var defaults = {
            limit: 5,                       //number of tweets to show
            username: 'philipbeel',         //@username tweets to display
            time: false,                    //display date
			rotate: false,
			speed: 5000,
            replies: false,                 //filter out @replys
            position: 'append',             //append position
            onComplete: function($ul) {}
        };
        //overwrite the defaults
        var options = $.extend(defaults, options);
        //loop through each instance
        return this.each(function (options) {
            //assign our initial vars
            var act = $(this);
            var $tweetList = $('<ul class="tweetList">')[defaults.position.toLowerCase() + 'To'](act);
            var tweetMonth = '';
            var shortMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            var api = "http://api.twitter.com/1/statuses/user_timeline.json?screen_name=";
            var count = "&count=";
            //do a JSON request to twitters API
            $.getJSON(api + defaults.username + count + defaults.limit + "&callback=?", act, function (data) {
                var ctr = 0;
                //loop through twitters response
                $.each(data, function (i, tweet) {
                    //handle @reply filtering if required
                    if (defaults.replies === false && tweet.in_reply_to_status_id != null)
                        return;
                    
                    i = ctr++;
                    
                    $tweetList.append('<li class="tweet_content_' + i + '"><p class="tweet_link_' + i + '">' + tweet.text.replace(/#(.*?)(\s|$)/g, '<span class="hash">#$1 </span>').replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, '<a href="$&">$&</a> ').replace(/@(.*?)(\s|\(|\)|$)/g, '<a class="mentioned" href="http://twitter.com/$1">@$1 </a>$2') + '</p></li>');
                    
                    //display the time of tweet if required
                    if (defaults.time == true) {
                        for(var iterate=0; iterate<=12; iterate++) {
                            if(shortMonths[iterate] == tweet.created_at.substr(4, 3)) {
                                tweetMonth = iterate + 1;
                                if(tweetMonth < 10) {
                                    tweetMonth = '0' + tweetMonth;
                                }
                            }
                        }
                        $('.tweet_link_' + i).prepend('<p><a href="http://www.twitter.com/'+ defaults.username +'/statuses/'+ tweet.id_str +'"><small> ' +relative_time(tweet.created_at)+ '</small></a></p>');
                    }
					
                });//close the unordered list
				
				//rotate tweets if required
				if ( defaults.rotate == true ) {
					var element = $tweetList.find('li'),
					length = element.length,
					current = 0,
					timeout = defaults.speed;				
					function changeTweets() {
					element.eq(current++).fadeOut(300, function(){
						if(current === length){
							current = 0;
						}
						
						element.eq(current).fadeIn(300);
					});		
					setTimeout(changeTweets, timeout);
					}
					element.slice(1).hide();
					setTimeout(changeTweets, timeout);
				}		
                
				defaults.onComplete($tweetList);
				
            });
        });
    }
})(jQuery);

function relative_time(time_value) {
  var values = time_value.split(" ");
  time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
  var parsed_date = Date.parse(time_value);
  var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
  var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
  delta = delta + (relative_to.getTimezoneOffset() * 60);

  if (delta < 60) {
    return 'less than a minute ago';
  } else if(delta < 120) {
    return 'about a minute ago';
  } else if(delta < (60*60)) {
    return (parseInt(delta / 60)).toString() + ' minutes ago';
  } else if(delta < (120*60)) {
    return 'about an hour ago';
  } else if(delta < (24*60*60)) {
    return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
  } else if(delta < (48*60*60)) {
    return '1 day ago';
  } else {
    return (parseInt(delta / 86400)).toString() + ' days ago';
  }
}