const synthesis = window.speechSynthesis;
//const synthesisText = document.querySelector('#synthesisText');

function speak(TextToSpeech){
  const utter = new SpeechSynthesisUtterance(TextToSpeech);
      console.log("el sintetizador es: "+TextToSpeech);
  // the list of all available voices
  const voices = synthesis.getVoices();
  
  for(i = 0; i < voices.length; ++i) {
    if(voices[i].name === "Monica") {
    //if(voices[i].lang === "es-ES") {  
      utter.voice = voices[i];
      console.log("la voz es: "+voices[i].name);
    }
  }
  
  utter.rate = 1;
  utter.pitch = 1;
  synthesis.speak(utter);
}