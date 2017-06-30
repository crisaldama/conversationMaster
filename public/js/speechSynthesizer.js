const synthesis = window.speechSynthesis;
//const synthesisText = document.querySelector('#synthesisText');

function speak(TextToSpeech){
  const utter = new SpeechSynthesisUtterance(TextToSpeech);
  // the list of all available voices
  const voices = synthesis.getVoices();
  
  for(i = 0; i < voices.length; ++i) {
    //if(voices[i].name === "Google Español") {
    if(voices[i].lang === "es-ES") {  
      utter.voice = voices[i];
      console.log(voices[i].name);
    }
  }
  
  utter.rate = 1;
  utter.pitch = 1;
  synthesis.speak(utter);
}