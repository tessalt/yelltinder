// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function click(e) {
  chrome.tabs.executeScript(null,
      {code:"document.body.style.backgroundColor='" + e.target.id + "'"});
  window.close();
}

function nope() {
  chrome.tabs.executeScript(null, {
    code: "document.querySelector('.recsGamepad__button--dislike').click()"}
  );
}

function yep() {
  chrome.tabs.executeScript(null, {
    code: "document.querySelector('.recsGamepad__button--like').click()"}
  );
}

document.addEventListener('DOMContentLoaded', function () {

  var setting = document.getElementById('setting')

setting.addEventListener("click", function () {
  chrome.tabs.create({
      url: chrome.runtime.getURL("options.html")
  });
});

  var start_button = document.getElementById('start_button')
  var log = document.getElementById('log')

  var final_transcript = '';
  var recognizing = false;
  var ignore_onend;
  var start_timestamp;

  if (!('webkitSpeechRecognition' in window)) {
    console.log('sorry for your browser')
  } else {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
      recognizing = true;
      console.log('starting')
      console.log('speak now')
    };

    recognition.onerror = function(event) {
      if (event.error == 'no-speech') {
        console.log('no speech')
        ignore_onend = true;
      }
      if (event.error == 'audio-capture') {
        console.log('no mic')
        ignore_onend = true;
      }
      if (event.error == 'not-allowed') {
        if (event.timeStamp - start_timestamp < 100) {
          console.log('blocked')
        } else {
          console.log('not allowed')
        }
        ignore_onend = true;
      }
    };

    recognition.onend = function() {
      recognizing = false;
      if (ignore_onend) {
        return;
      }
      if (!final_transcript) {
        console.log('info_start');
        return;
      }
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
        var range = document.createRange();
        range.selectNode(document.getElementById('final_span'));
        window.getSelection().addRange(range);
      }
    };

recognition.onresult = debounce(onResult, 300)

    function onResult (event) {
      var interim_transcript = '';
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          var word = event.results[i][0].transcript;
          console.log('heard', word)
          swipe(word);
          interim_transcript += event.results[i][0].transcript;
          log.value = interim_transcript;
        }
      }
    };
  }

  function swipe(word) {
    console.log('calling swipe on', word)
    var nopeWords = /no$|nope|ew|gross|bad|left/g;
    var yepWords = /yes|yeah|yep|sure|okay|right/g;
    if (word.match(nopeWords)) {
      nope();
    } else if (word.match(yepWords)) {
      yep();
    }
  }

  function swipeRight(word) {
    if (word.match(yepWords)) {
      yep();
    }
  }

  start_button.addEventListener('click', startButton)

  function startButton(event) {
    if (recognizing) {
      recognition.stop();
      return;
    }
    final_transcript = '';
    recognition.lang = 'en-US';
    recognition.start();
    ignore_onend = false;
    start_img.src = 'mic-slash.gif';
    showInfo('info_allow');
    showButtons('none');
    start_timestamp = event.timeStamp;
  }

  function showInfo(s) {
    if (s) {
      for (var child = info.firstChild; child; child = child.nextSibling) {
        if (child.style) {
          child.style.display = child.id == s ? 'inline' : 'none';
        }
      }
      info.style.visibility = 'visible';
    } else {
      info.style.visibility = 'hidden';
    }
  }

var current_style;
function showButtons(style) {
}


});