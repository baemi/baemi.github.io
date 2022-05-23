// const { ipcRenderer } = require('electron');
// const jQuery = require('jquery');
// require('jquery-ui/ui/effect');

// const $ = jQuery;

// ipcRenderer.on('start-roulette', (e, arg) => {
//   const data = arg.data;

//   insertTask(data);
// });

let ws = null;

$(document).ready(() => {
  setupWebsocket();
});

function setupWebsocket() {
  ws = new WebSocket("ws://localhost:20115");

  ws.onopen = e => {
    console.log('open');
  };

  ws.onclose = e => {
    console.log('close', e);

    setTimeout(setupWebsocket, 10000);
  }

  ws.onmessage = e => {
    const data = JSON.parse(e.data);
    insertTask(data);
  }
}


const queue = [];
let doStart = false;

function insertTask(data) {
  queue.unshift(data);

  if(!doStart)
    startRoulette();
}


function doTest() {
  const data = {
    "rewardId": "bdb80841-5c6e-4e49-91bd-0f6d6aa5ba43",
    "username": "양심을판청산가리(algol68)",
    "title": "테스트",
    "cost": 1,
    "timestamp": 1652611757215,
    "result": {
      "name": "꽝",
      "rate": 99.99
    },
    "itemList": [
      {
        "name": "꽝",
        "rate": 99.99
      },
      {
        "name": "당첨",
        "rate": 0.01
      }
    ],
    "win": false
  };

  startRoulette(data);
}

const rouletteImage = document.createElement("img");

function startRoulette() {
  doStart = true;
  const data = queue.pop();

  console.log(data);

  let rouletteListTemplate = createRouletteItemList(data.itemList);
  rouletteListTemplate += `<li><span>${data.result.name}</span></li>`;
  $('#roulette ul').html(rouletteListTemplate);

  const dstTop = 40 * 66 - 66;
  const audio = new Audio('./sounds/roulette.mp3');
  audio.volume = 0.7;
  audio.currentTime = 1;

  const rewardAudio = new Audio('./sounds/reward.wav');
  rewardAudio.volume = 0.7;

  /**
   * CC0 1.0 Universal
   * Short jingles by Kenney Vleugels (www.kenney.nl)
   */
  const failedAudio = new Audio('./sounds/failed.mp3');
  failedAudio.volume = 0.5;
  // audio.loop = true;

  $('#roulette')
    .animate({
      opacity: 1
    }, 1000, () => {
      audio.play();

      const viewerInfo = `${data.displayName ? data.displayName : data.login}님이 ${data.title}을(를) 사용하였습니다.`;
      $('.roulette-viewer-info').html(viewerInfo);

      $('#roulette ul')
        .animate({
          top: '0px'
        }, 0, () => {
          setTimeout(() => {
            rouletteImage.src = '';
            rouletteImage.src = './img/kong_show.gif';
            $('.roulette-ani-wrapper').append(rouletteImage);
          }, 2500);
        })
        .animate({
          top: `-${dstTop}px`
        }, 4000, 'easeOutSine', () => {
          if(data.result.rewardAt) {
            rewardAudio.play();
          } else {
            failedAudio.play();
          }
        });
    })
    .delay(5500)
    .animate({
      opacity: 0
    }, 1000, () => {
      $('.roulette-ani-wrapper').html(null);
      $('.roulette-viewer-info').html(null);
      $('#roulette ul').css('top', '0px');

      audio.pause();

      if(queue.length > 0) {
        setTimeout(() => {
          startRoulette();
        }, 1000);
      } else {
        doStart = false;
      }
    });
}

function createRouletteItemList(itemList) {
  let template = '';

  for (let i = 0; i < 39; i++) {
    const randomIndex = getRandomInteger(0, itemList.length);

    template += `<li><span>${itemList[randomIndex].name}</span></li>`;
  }

  return template;
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}