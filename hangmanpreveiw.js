// Declare variables
let port;
let reader;
let inputDone;
let outputDone;
let inputStream;
let outputStream;
let answer = '';
let maxWrong = 7;
let mistakes = 0;
let guessed = [];
let wordStatus = '';
let wins = 0;
let losses = 0;

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





async function Test(){

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
function writeToStream(...data) {
  // Write to output stream
  if (port && port.writable) {
      const writer = port.writable.getWriter();
      data.forEach(async (data) => {
          await writer.write(data);
      });
      writer.releaseLock();
  }
}


// Function to send Ctrl+C to the serial port
function sendCtrlC() {
    // Send CTRL-C and turn off echo on REPL
    writeToStream('\x03'); // ASCII code for CTRL-C
}

// Word bank for the hangman game

var WordBank = [
  "   ",
  "apple",
  "banana",
  "cherry",
  "dog",
  "elephant",
  "frog",
  "giraffe",
  "hamburger",
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
  "elephant",
  "flower",
  "diabetes",
  "guitar",
  "honey",
  "island",
  "jacket",
  "kite",
  "diabetic",
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
  "xylophone",
  "yacht",
  "zeppelin",
  "apple",
  "banana",
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
  "elephant",
  "flower",
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
  "xylophone",
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
  "star"
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

// Function to reset the hangman game
function reset() {
  
  mistakes = 0;
  guessed = [];
  document.getElementById('hangmanPic').src = './images/Error0.png';
  document.getElementById('randomGifwin').style.display = 'none';
  document.getElementById('randomGifloss').style.display = 'none';
  readLoop();
  let popup = document.getElementById('popup'); // Declare and initialize the popup variable
  if (popup) {
      popup.style.display = 'none';
  }
  
  // Move randomGif initialization here
  let gifPathwin = randomGifwin();
  document.getElementById('randomGifwin').src = gifPathwin;
  let gifPathloss = randomGifloss();
  document.getElementById('randomGifloss').src = gifPathloss;
  console.log("Gif Path:", gifPathwin);
  console.log("Gif Path:", gifPathloss);
  randomWord();
  guessedWord();
  updateMistakes();
  generateButtons();
  console.log("Answer:", answer);
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

    document.getElementById('keyboard').innerHTML = buttonsHTML;
}

// Event listener for keyboard key press
document.addEventListener('keydown', function (event) {
  // Check if the pressed key is a letter
  if (/^[a-zA-Z]$/.test(event.key)) {
      handleGuess(event.key.toLowerCase()); // Convert to lowercase
  }
});


// Function to handle a guessed letter
function handleGuess(chosenLetter) {

  readLoop();
  
  guessed.indexOf(chosenLetter) === -1 ? guessed.push(chosenLetter) : null;
  console.log("Chosen Letter:", chosenLetter);
  //console.log("Answer:", answer);
  //console.log("Guessed:", guessed);

  let element = document.getElementById(chosenLetter);
  if (element) {
      element.setAttribute('disabled', true);
  }

  if (answer.indexOf(chosenLetter) >= 0) {
      guessedWord();
      checkIfGameWon();
  } else if (answer.indexOf(chosenLetter) === -1) {
      mistakes++;
      updateMistakes();
      checkIfGameLost();
      updateHangmanPicture();
  }

  writeToStream('LCD :SEG');
  writeToStream('Mistakes: ' + mistakes + ' of 7');
}

// Function to update the hangman picture
function updateHangmanPicture() {
    document.getElementById('hangmanPic').src = './images/Error' + mistakes + '.png';
    document.getElementById('hangmanPic').style.float = 'left';
    document.getElementById('hangmanPic').style.height = '40%';
}

// Function to check if the game is won
function checkIfGameWon() {
  if (wordStatus === answer) {
    togglePopup();
    wins++;
    updateWinLossDisplay();
    document.getElementById('randomGifwin').style.display = 'none';
    toggleWinGif();
    document.getElementById('randomGifwin').style.float = 'center';
    document.getElementById('randomGifwin').style.height = '500px';
    document.getElementById('popupMessage').innerHTML = 'You Won!!!';
    document.getElementById('popupMessage2').innerHTML = 'Game Over! The answer was: ' + answer;
  }
  updateWinLossDisplay();
}

// Function to check if the game is lost
function checkIfGameLost() {
    if (mistakes === maxWrong) {
        togglePopup();
        losses++;
        document.getElementById('randomGifwin').style.display = 'none';
        togglelossGif();
        document.getElementById('randomGifloss').style.float = 'center';
        document.getElementById('randomGifloss').style.height = '500px';
        document.getElementById('popupMessage').innerHTML = 'You Lost!!!';
        document.getElementById('popupMessage2').innerHTML = 'Game Over! The answer was: ' + answer;
      
    }
    updateWinLossDisplay();
}

// Function to display guessed letters in the word
function guessedWord() {
    wordStatus = answer
        .split('')
        .map(letter => (guessed.includes(letter.toLowerCase()) || guessed.includes(letter.toUpperCase()) ? letter : " _ "))
        .join('');

    document.getElementById('wordSpotlight').innerHTML = wordStatus;
    //writeToStream('Word: ' + wordStatus);
}

// Function to update the mistakes count on the screen
function updateMistakes() {
    document.getElementById('mistakes').innerHTML = mistakes;
    //writeToStream('Mistakes: ' + mistakes + ' of 7');
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
connect();
updateWinLossDisplay();  // Initialize win and loss counts on page load