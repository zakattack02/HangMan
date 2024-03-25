// Wrap the code inside a function
function hangmanGame() {
   
    // Define an array of words
    const words = ["apple", "banana", "cherry", "durian", "elderberry"];

    // Select a random word from the array
    const randomWord = words[Math.floor(Math.random() * words.length)];

    // Create an array to store the guessed letters
    const guessedLetters = [];

    // Create a variable to store the number of incorrect guesses
    let incorrectGuesses = 0;

    // Create a function to update the word display
    function updateWordDisplay() {
        // Code for updating the word display
    }

    // Create a function to handle the guess button click event
    function handleGuessButtonClick() {
        // Code for handling the guess button click event
    }

    // Create a function to update the guesses display
    function updateGuessesDisplay() {
        var guessesContainer = document.getElementById("guesses-container");
        guessesContainer.textContent = "Incorrect guesses: " + incorrectGuesses;
    }
   

    // Create a function to check if the game is over
    function checkGameOver() {
        var messageContainer = document.getElementById("message-container");

     if (incorrectGuesses >= 6) {
         messageContainer.textContent = "Game over. The word was: " + randomWord;
         document.getElementById("guess-button").disabled = true;
     } else if (!document.getElementById("word-container").textContent.includes("_")) {
         messageContainer.textContent = "Congratulations! You guessed the word: " + randomWord;
         document.getElementById("guess-button").disabled = true;
     }
 }

    // Add event listener to the guess button
    document.getElementById("guess-button").addEventListener("click", handleGuessButtonClick);

    // Initial update of word display
    updateWordDisplay();
}

// Call the hangmanGame function when the HTML page is loaded
window.addEventListener("load", hangmanGame);
