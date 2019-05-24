const debugMode = true;

importToFonts();

var target;
var originText = target;
var dragging = false;

$('*').click(function() {
  // 아무곳 클릭 시 bubble 삭제
  bubbleDown();
});

$('*').mouseup(function(e) {
  e.stopPropagation();      // 여러 번 호출되는 것을 prevent (* selctor is one or more elements)

  // window.getSelection().toString().length < 150 인 경우
  if (window.getSelection && window.getSelection().toString().length > 1 
    && window.getSelection().toString().length < 300) {

    // 드래그한 상태에서 다른 text 드래그 시 삭제
    if (dragging == true) {
      bubbleDown();
      dragging = false;
    }

    dragging = true;

    // dragged: 드래그한 element
    const dragged = window.getSelection().toString();

    if (debugMode) {
      console.log(dragged);    
    }
    
    target = $(this);
    originText = target.html();

    translate(dragged); // translate -> bubbleUp action

  }
});

function addItem(_before, _after) {
  chrome.runtime.sendMessage(
    {
      msg: 'ADD',
      data: {
        before: _before,
        after: _after
      }
    }
  );

  // 성공적으로 아이템 추가 시 팝업 창 띄우기 (additional)
}

function translate(dragged) {

  let data = {
    msg: 'TRANSLATE',
    data: {
      before: dragged
    }
  };

  // Translate dragged
  chrome.runtime.sendMessage(data, function(response) {
    if (response) {
      if (debugMode) {
        console.log(response);
      }
      
      bubbleUp(dragged, response.response);

    } else {
      if (debugMode) {
        console.log('No reponse')
      }
    }
  });
}

function bubbleUp(_before, _after) {
  // 매개변수에 target 추가 필요

  const bubble_css = {
    'position': 'absolute',
    'font-family': 'Noto Sans KR, sans-serif',
    'margin-top': '-3em',
    'padding': '5px 40px 5px 10px',
    'border-radius': '20px',
    'background': 'black',
    'color': 'white',
    'max-width': '500px',
    'font-size': '12pt',
    'white-space': 'nowrap',
    'overflow': 'hidden',
    'text-overflow': 'ellipsis',
    'z-index': 9999
  };
  
  const dragged_css = {
    'background-color': 'gray',
    'color': 'white'
  };

  const add_css = {
    'position': 'absolute',
    'top': '50%',
    'right': '15px',
    'margin-top': '-10px',
    'width': '20px',
    'height': '20px'
  }

  target.html(originText.replace(_before, 
    "<span class='bubble'>" 
      + _after
      + "<button class='add' />"
    + "</span>"  
    + "<span class='dragged'>" + _before + "</span>"));

  $('span.bubble').css(bubble_css);
  $('button.add').css(add_css);
  $('span.dragged').css(dragged_css);

  // click 이벤트 추가
  $('button.add').click(function() {
    // dragged가 온전하지 못한 문장일 경우 수정 필요
    if (debugMode) {
      console.log(target.children());
    }

    const before = target.children('.dragged').text();
    const after = target.children('.bubble').text();
    
    addItem(before, after);
  });
}

function bubbleDown() {
  $('span.bubble').remove();
  $('span.dragged').contents().unwrap();
}

function importToFonts() {
  // Import google web fonts
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', 'https://fonts.googleapis.com/css?family=Noto+Sans+KR:500&display=swap');
  // Add more fonts here

  document.head.appendChild(link);
}