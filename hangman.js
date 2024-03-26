// Declare variables
const fs = require('fs');
let port;
let reader;
let inputDone;
let outputDone;
let inputStream;
let outputStream;
let answer = '';
let maxWrong = 7;
let mistakes;
let guessed = [];
let answerspaced = '';
let wordStatus = '';
let spacedword = '';
let blankwordStatus = '';
let wins = 0;
let losses = 0;
let scrollInterval;
let writeToLCD = true;
let total = wins + losses;

// this function returns a promise that resolves after n milliseconds
const wait = (n) => new Promise((resolve) => setTimeout(resolve, n));

// Function to connect to the serial port
async function connect() {
  try {
    // Prompt user to select any serial port.
    port = await navigator.serial.requestPort();

    // Wait for the serial port to open.
    await port.open({ baudRate: 9600 });

    // Setup the output stream and read loop here.
    const ports = await navigator.serial.getPorts();
    console.log(ports);
    // Call readLoop only once after opening the port
    readLoop();
  } catch (error) {
    console.error('Error connecting to serial port:', error);
  }
}


async function readLoop() {
  // Check if the port object is defined
  if (!port) {
    console.error('Serial port is not initialized.');
    return;
  }

  const reader = port.readable.getReader();

  while (true) {
    let result;
    try {
      result = await reader.read();
    } catch (error) {
      console.error('Error reading from the serial port:', error);
      break;
    }

    const { value, done } = result;

    if (done) {
      console.log('Reader is done.');
      break;
    }

    // Ensure that the value is a string before processing
    if (typeof value === 'string' || value instanceof Uint8Array) {
      // Convert Uint8Array to string
      const receivedData = (typeof value === 'string') ? value : new TextDecoder().decode(value);

      if (receivedData.trim().length > 0) {
        console.log('Received:', receivedData);
        // Call the function to handle the received data
        handleGuess(receivedData);
        chosenLetter = receivedData;
      }
    } else {
      console.error('Received data is not a string or Uint8Array:', value);
    }
  }
  // Release the lock after processing each chunk of data
  reader.releaseLock();

  // Call readLoop again after releasing the lock
  readLoop();
}



async function Test() {

  const ports = await navigator.serial.getPorts();
  console.log(ports);
}
// Function to disconnect from the serial port
async function disconnect() {
  // Close the input stream (reader).
  if (reader) {
    await reader.cancel();
    reader.releaseLock();
  }

  // Close the output stream.
  // Close the port.
  if (port) {
    await port.close();
  }
}

// Function to write data to the serial port
async function writeToStream(data) {
  // Write to output streamx
  if (port && port.writable) {
    const encoder = new TextEncoder();
    const dataOut = encoder.encode(data);
    const writer = port.writable.getWriter();
    console.log('Writing:', data);
    await writer.write(dataOut);
    writer.releaseLock(dataOut);
    return data;
  }
  return data;
}


// Function to send Ctrl+C to the serial port
function sendCtrlC() {
  // Send CTRL-C and turn off echo on REPL
  //writeToStream('\x03'); // ASCII code for CTRL-C
}

// Word bank for the hangman game
var WordBank = [
  "banana",
  "apple",
  "cherry",
  "dog",
  "elephant",
  "frog",
  "giraffe",
  "hamburger",
  "icecream",
  "jellyfish",
  "kangaroo",
  "lemon",
  "monkey",
  "noodle",
  "orange",
  "penguin",
  "quail",
  "rabbit",
  "strawberry",
  "turtle",
  "unicorn",
  "violet",
  "watermelon",
  "xylophone",
  "yogurt",
  "zebra",
  "airplane",
  "ball",
  "car",
  "dolphin",
  "flower",
  "diabetes",
  "guitar",
  "honey",
  "island",
  "jacket",
  "kite",
  "lion",
  "moon",
  "notebook",
  "ocean",
  "piano",
  "queen",
  "rainbow",
  "sun",
  "tree",
  "umbrella",
  "violin",
  "waterfall",
  "yacht",
  "zeppelin",
  "taco",
  "pizza",
  "sushi",
  "cookie",
  "chocolate",
  "cheese",
  "bread",
  "butter",
  "chicken",
  "fish",
  "bear",
  "cat",
  "horse",
  "mouse",
  "owl",
  "panda",
  "snake",
  "tiger",
  "whale",
  "wolf",
  "book",
  "chair",
  "clock",
  "door",
  "hat",
  "house",
  "key",
  "light",
  "pen",
  "phone",
  "ship",
  "shoe",
  "table",
  "tent",
  "train",
  "beach",
  "city",
  "desert",
  "forest",
  "jungle",
  "mountain",
  "river",
  "space",
  "cloud",
  "color",
  "family",
  "friend",
  "game",
  "music",
  "number",
  "rain",
  "sleep",
  "star",
];


// Function to generate a random GIF path
function randomGifwin() {

  let gifs = [
    "images/Excellent.gif",
    "images/greatsucces.gif",
    "images/win.gif",
    "images/win2.gif",
    "images/win3.gif",
    "images/youwinthistime.gif"
    // Add more gif paths here
  ];

  let randomIndexwin = Math.floor(Math.random() * gifs.length);
  let randomGifPathwin = gifs[randomIndexwin];

  return randomGifPathwin;
}

function randomGifloss() {
  let gifs = [
    "images/loss1.gif",
    "images/loss2.gif",
    "images/patrick.gif",
    "images/pepe-the-frog-laptop-cry.gif",
    "images/L.gif"
    // Add more gif paths here
  ];

  let randomIndexloss = Math.floor(Math.random() * gifs.length);
  let randomGifPathloss = gifs[randomIndexloss];

  return randomGifPathloss;
}
// Set this variable to false when you want to stop writing to the LCD

function scrollLCD(text) {
  let scrollIndex = 0;
  const scrollInterval = setInterval(async () => {
    const scrolledText = text.substring(scrollIndex, scrollIndex + 16); // Limit the scrolled text to 16 characters per line

    if (writeToLCD) {
      await writeToStream(scrolledText); // Send the scrolled text through writeToStream
    }
    
    console.log(scrolledText);
    scrollIndex++;
    if (scrollIndex > text.length - 16) {
      clearInterval(scrollInterval);
    }
  }, 300); // Adjust the scroll speed as needed
}


// Function to send the message periodically
function sendPeriodicMessage(message, interval) {
  setInterval(async () => {
    if (writeToLCD) {
      await writeToStream(answerspaced);
    }
    scrollLCD(message);
    console.log(message);
  }, interval);
}


/* Example usage
sendPeriodicMessage("Hello, world!", 2000); // Send "Hello, world!" every 2 seconds
*/

// Function to reset the hangman game
async function reset() {
  // Event listener for keyboard key press
  //console.log(WordBank);
  const WordBank = fs.readFileSync('WordBank.txt', 'utf-8').split('\n');
  clearInterval(sendPeriodicMessage);
  clearInterval(scrollInterval);
  writeToLCD = false; 
  mistakes = 0;
  document.addEventListener('keydown', handleGuess);
  guessed = [];
  document.getElementById('hangmanPic').src = './images/Error0.png';
  document.getElementById('randomGifwin').style.display = 'none';
  document.getElementById('randomGifloss').style.display = 'none';
  //readLoop();
  let popup = document.getElementById('popup'); // Declare and initialize the popup variable
  if (popup) {
    popup.style.display = 'none';
  }

  wait
  // Move randomGif initialization here
  let gifPathwin = randomGifwin();
  document.getElementById('randomGifwin').src = gifPathwin;
  let gifPathloss = randomGifloss();
  document.getElementById('randomGifloss').src = gifPathloss;
  console.log("Gif Path:", gifPathwin);
  console.log("Gif Path:", gifPathloss);
  randomWord();
  guessedWord();
  //updateMistakes();
  generateButtons();
  console.log("Answer:", answer);
  await wait(10);
  //await writeToStream('');
  //await writeToStream(mistakes);
  let data = await writeToStream('___New Game!____' + '___New Game!____' + mistakes);
  console.log("writeToStream:", data, data.length);
  //let data = await writeToStream(spacedword + '________________' + mistakes);
  //await writeToStream("abcdefghijklmnopqrstuvwxyzsecret3");
  console.log("writeToStream:", data, data.length);
  total = wins + losses;
  mistakes = 0;
}


// Function to generate random word from the word bank
function randomWord() {
  answer = WordBank[Math.floor(Math.random() * WordBank.length)];
}

// Function to generate on-screen keyboard buttons
function generateButtons() {
  let buttonsHTML = 'abcdefghijklmnopqrstuvwxyz'.split('').map(letter =>
    `
        <button
            class="btn btn-lg btn-primary m-2"
            id='` + letter + `'
            onClick="handleGuess('` + letter + `')"
        >
            ` + letter + `
        </button>
    `).join('');

  //document.getElementById('keyboard').innerHTML = buttonsHTML;
  let keyboardElement = document.getElementById('keyboard');

  if (keyboardElement) {
    keyboardElement.innerHTML = buttonsHTML;
  } else {
    console.error("Element with ID 'keyboard' not found.");
  }

}
document.addEventListener('keydown', handleGuess);


// Function to handle a guessed letter
async function handleGuess(guessedLetter) {
  if (/^[a-zA-Z]$/.test(guessedLetter)) {
    const chosenLetter = guessedLetter.toLowerCase(); // Directly use the guessedLetter parameter
    // Use chosenLetter within this block
    guessed.indexOf(chosenLetter) === -1 ? guessed.push(chosenLetter) : null;
    console.log("Chosen Letter:", chosenLetter);
    //console.log("Answer:", answer);
    //console.log("Guessed:", guessed);
    let data = await writeToStream(spacedword + '                ' + mistakes);
    await writeToStream(spacedword + '                ' + mistakes);
    //console.log(`(${data})(${data.length})`);
    console.log("writingToStream:", data, data.length);
    //await writeToStream("abcdefghijklmnopqrstuvwxyzsecret3");

    let element = document.getElementById(chosenLetter);
    if (element) {
      element.setAttribute('disabled', true);
    }

    if (answer.indexOf(chosenLetter) >= 0) {
      guessedWord();
      checkIfGameWon();
    } else if (answer.indexOf(chosenLetter) === -1) {
      updateMistakes();
      checkIfGameLost();
      updateHangmanPicture();
    }
  }
  // Assuming guessedLetter is a string representing the letter guessed
  if (/^[a-zA-Z]$/.test(event.key.toLowerCase())) { 
    const chosenLetter = event.key.toLowerCase(); // Define chosenLetter here
    // Use chosenLetter within this block
    guessed.indexOf(chosenLetter) === -1 ? guessed.push(chosenLetter) : null;
    console.log("Chosen Letter:", chosenLetter);
    //console.log("Answer:", answer);
    //console.log("Guessed:", guessed);
    let data = await writeToStream(spacedword + '                ' + mistakes);
    //console.log(`(${data})(${data.length})`);
    console.log("writingToStream:", data, data.length);
    //await writeToStream("abcdefghijklmnopqrstuvwxyzsecret3");
    let element = document.getElementById(chosenLetter);
    if (element) {
      element.setAttribute('disabled', true);
    }

    if (answer.indexOf(chosenLetter) >= 0) {
      guessedWord();
      checkIfGameWon();
    } else if (answer.indexOf(chosenLetter) === -1) {
      updateMistakes();
      checkIfGameLost();
      updateHangmanPicture();
    }
  }
}

// Function to update the hangman picture
function updateHangmanPicture() {
  document.getElementById('hangmanPic').src = './images/Error' + mistakes + '.png';
  document.getElementById('hangmanPic').style.float = 'left';
  document.getElementById('hangmanPic').style.height = '40%';
}

// Function to check if the game is won
async function checkIfGameWon() {

  total = wins + losses;
  if (wordStatus === answer) {
    document.removeEventListener('keydown', handleGuess);
    togglePopup();
    wins++;
    updateWinLossDisplay();
    document.getElementById('randomGifwin').style.display = 'none';
    toggleWinGif();
    document.getElementById('randomGifwin').style.height = '450px';
    document.getElementById('popupMessage').innerHTML = 'You Won!!!';
    document.getElementById('popupMessage2').innerHTML = 'The answer was: ' + answer;
    //updateMistakes();
    guessedWord();
    document.addEventListener('keydown', YNButton);
    //await writeToStream(answerspaced + '________________' + mistakes);
    writeToLCD = true; 
    //await wait(500);
    total = wins + losses;
    scrollLCD('Well Done! You have solved ' + wins + ' out of ' + total + ' puzzles!',200);
    await wait(16000);
    writeToLCD = false;
    await writeToStream('____GAME_OVER___' + '____GAME_OVER___');
    //await wait(10000);
    // Wait for user input to reset or exit
    //await waitForUserInput();
  }
  updateWinLossDisplay();
}


// Function to check if the game is lost
async function checkIfGameLost() {
 
  total = wins + losses;
  
  if (mistakes === maxWrong) {
    losses++;
    document.removeEventListener('keydown', handleGuess);
    togglePopup();
    
    document.getElementById('randomGifwin').style.display = 'none';
    togglelossGif();
    document.getElementById('randomGifloss').style.height = '700px';
    document.getElementById('popupMessage').innerHTML = 'You Lost!!!';
    document.getElementById('popupMessage2').innerHTML = 'The answer was: ' + answer;
    //updateMistakes();
    guessedWord();
    document.addEventListener('keydown', YNButton);
    writeToLCD = true;
    //await wait(500);
    scrollLCD ('Sorry! The correct word was ' + answer + ' you have solve '+ wins + ' puzzles out of ' + total + ' puzzles!', 200);
    await wait(9500);
    writeToLCD = false;
    await writeToStream('____GAME_OVER___' + '____GAME_OVER___');
    //await wait(10000);
  
  
  }
  updateWinLossDisplay();
}
async function YNButton(event) {
  await wait(1000)
  pressedKey = event.key.toLowerCase();
  if (pressedKey === "y") {
    reset();
    //clearInterval(sendPeriodicMessage);
    //clearInterval(scrollInterval);
    document.removeEventListener('keydown', YNButton);
    return;
  }
  else if (pressedKey === "n") {
    // Close the Chrome tab or take any other action
    window.location.href = 'WINNER.html';
    //await writeToStream('____GAME_OVER___' + '____GAME_OVER___' + mistakes);
    await wait(888);
    await writeToStream('____GAME_OVER___' + '____GAME_OVER___' + mistakes);
    //sendPeriodicMessage(wins + ' out of ' + total + ' puzzles!', 1000);
    return;
  }
}
// Function to remove spaces between underscores
function removeSpaces(wordStatus) {
  return wordStatus.replace(/ /g, '');
}


// Function to display guessed letters in the word
async function guessedWord() {
  wordStatus = answer
    .split('')
    .map(letter => (guessed.includes(letter.toLowerCase()) || guessed.includes(letter.toUpperCase()) ? letter : " _ "))
    .join('');
  //console.log(wordStatus,wordStatus.length);
  document.getElementById('wordSpotlight').innerHTML = wordStatus;

  blankwordStatus = removeSpaces(wordStatus);

  answerspaced = answer;
  while (answerspaced.length < 16) {
    answerspaced += ' ';
  }

  spacedword = blankwordStatus;
  while (spacedword.length < 16) {
    spacedword += ' ';
  }
  await writeToStream(spacedword + '________________' + mistakes);
  //await writeToStream(mistakes + wordStatus + '                ');
  //await writeToStream('Test');
  //await writeToStream(mistakes);
}

// Function to update the mistakes count on the screen
function updateMistakes() {
  if (mistakes < 7) {
    mistakes++;
    document.getElementById('mistakes').innerHTML = mistakes;
  }else{
    mistakes =0;
  }
  console.log(mistakes);
  return;
}

// Function to toggle the visibility of the popup
function togglePopup() {
  let popup = document.getElementById('popup');
  if (popup) {
    popup.style.display = (popup.style.display === 'none') ? 'block' : 'none';
  }
}

// Function to toggle the visibility of the gifs
function toggleWinGif() {
  let randomGifwin = document.getElementById('randomGifwin');
  if (randomGifwin) {
    randomGifwin.style.display = (randomGifwin.style.display === 'none') ? 'block' : 'none';
  }
  updateWinLossDisplay();
}

function togglelossGif() {
  let randomGifloss = document.getElementById('randomGifloss');
  if (randomGifloss) {
    randomGifloss.style.display = (randomGifloss.style.display === 'none') ? 'block' : 'none';
  }
  updateWinLossDisplay();
}

function updateWinLossDisplay() {
  document.getElementById('winsCount').innerHTML = wins;
  document.getElementById('lossesCount').innerHTML = losses;
}

// Call when the page loads
randomWord();
generateButtons();
disconnect(); // Add this line to close any existing port
//readLoop();
//connect();
updateWinLossDisplay();  // Initialize win and loss counts on page load
