const SpeechRecognition = webkitSpeechRecognition;
const SpeechGrammarList = webkitSpeechGrammarList;
const SpeechRecognitionEvent = webkitSpeechRecognitionEvent;

/**
 * you can define your own grammar list
 */
// const colors = [ 'aqua' , 'azure' , 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral' ];
// const grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;';

const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();

/**
 *  add grammars
 *  the second parameter is a weight value that specifies the importance of this grammar 
 *  in relation of other grammars available in the list (can be from 0 to 1 inclusive.)
 */
// speechRecognitionList.addFromString(grammar, 1);
// recognition.grammars = speechRecognitionList;

/**
 * other settings
 */
// recognition.lang = 'en-US';
recognition.lang = 'es-ES';
// recognition.continuous = false;
recognition.interimResults = false;
recognition.maxAlternatives = 1;

/**
 * event handlers
 */
recognition.onresult = (e) => {
  const result = e.results[e.results.length - 1][0].transcript;

  const confidence = e.results[e.results.length - 1][0].confidence;
  console.log('result: ', result);
  console.log('confidence: ', confidence);
  updateResult(result,confidence);
}

recognition.onerror = (e) => {
  console.error(e);
}

recognition.onend = () => {
  console.log('recognition end.');
}

/**
 * other functions
 */
function updateResult(result,confidence) {
  //document.querySelector('#recognitionResult').innerHTML = 'Text: '+ result;
  //document.querySelector('#recognitionConfidence').innerHTML = ' With Confidence '+ confidence;
  var inputBox=document.querySelector('#textInput');
  document.querySelector('#textInput').value= result;
  document.querySelector('#start_img').src="img/mic.gif";
  submitInput(inputBox);
  console.log('result');
}

function start() {
  document.querySelector('#start_img').src="img/mic-animate.gif";
  recognition.start();
}
