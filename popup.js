(function() {


  const DOM = {
    toggle: document.getElementById('toggle'),
    button_icon: document.getElementById('toggle_icon'),
    log: document.getElementById('log'),
    debug: document.getElementById('debug'),
    fix_mic: document.getElementById('fix_mic')
  }

  const hostSelectors = {
    nope: "document.querySelector('.recsGamepad__button--dislike')",
    yep: "document.querySelector('.recsGamepad__button--like')",
    more: "document.querySelector('.recCard')",
    back: "document.querySelectorAll('.pageButton')[0]",
    next: "document.querySelectorAll('.pageButton')[1]",
  }

  const matches = {
    nope: /nope|gross|bad|left|boo|yikes/g,
    yep: /yes|yeah|yep|sure|good|okay|right|damn|guess/g,
    more: /more|maybe|pics/g
  }

  function triggerHostClick(element) {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
      var url = tabs[0].url;
      if (url.match(/tinder.com/)) {
        chrome.tabs.executeScript(null, {
          code: `${element}.click();`}
        );
      } else {
        alert('not tinder')
      }
    });
  }

  function recognize(result) {
    DOM.log.classList.add('active');
    DOM.log.textContent = result;
    if (result.match(matches.nope)) {
      log.style.color = '#f57e7e';
      triggerHostClick(hostSelectors.nope);
    } else if (result.match(matches.yep)) {
      log.style.color = '#71e875';
      triggerHostClick(hostSelectors.yep);
    } else if (result.match(matches.more)) {
      log.style.color = '#7ed2f5';
      triggerHostClick(hostSelectors.more);
    } else if (result.match(/back/)) {
      triggerHostClick(hostSelectors.back);
    } else if (result.match(/next/)) {
      triggerHostClick(hostSelectors.next);
      next();
    } else {
      log.style.color = 'white'
    }
  }

  const state = {
    listening: false,
    shouldRestart: false
  }

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimresults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    console.log('LISTENER: start');
    DOM.fix_mic.style.display = 'none';
  }

  recognition.onend = () => {
    console.log('LISTENER: stop');
    if (state.shouldRestart) {
      recognition.start();
      state.shouldRestart = false;
    }
  }

  recognition.onresult = (event) => {
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      const {transcript, confidence} = event.results[i][0];
      recognize(transcript)
    }
  }

  recognition.onspeechstart = () => {
    state.listening = true;
    setTimeout(() => {
      state.shouldRestart = true;
      recognition.stop();
    }, 300)
    DOM.log.textContent = '...'
  }

  recognition.onspeechend = () => {
    DOM.log.textContent = '-';
  }

  recognition.onError = ({error}) => {
    DOM.fix_mic.style.display = 'block';
    if (error == 'no-speech') {
      console.log('LISTENER: ERROR: no speech')
    }
    if (event.error == 'audio-capture') {
      console.log('LISTENER: ERROR: no mic')
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        console.log('LISTENER: ERROR: blocked')
      } else {
        console.log('LISTENER: ERROR: not allowed')
      }
    }
  }

  DOM.toggle.addEventListener('click', () => {
    if (state.listening) {
      recognition.stop();
      DOM.button_icon.textContent = 'mic'
      state.shouldRestart = false;
      DOM.toggle.classList.remove('active');
      DOM.log.classList.remove('active');
      DOM.log.textContent = ''
      state.listening = false;
    } else {
      recognition.start();
      DOM.toggle.classList.add('active');
      DOM.log.classList.add('active');
      DOM.log.textContent = '-';
      DOM.button_icon.textContent = 'mic_off'
      state.listening = true;
    }
  })

  DOM.fix_mic.addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html')
    });
  });
})();
/*

*/