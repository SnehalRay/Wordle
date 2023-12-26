let dictionary = []; // Global dictionary variable

async function loadDictionary() {
    const response = await fetch('https://raw.githubusercontent.com/seanpatlan/wordle-words/main/word-bank.csv');
    const text = await response.text();
    dictionary = text.split('\n').map(word => word.trim());
}

function setSecretWord() {
    state.secret = dictionary[Math.floor(Math.random() * dictionary.length)];
    console.log(state.secret); // Now it should print the secret word
}


const state = {
    secret: '',
    grid: Array(6).fill().map(() => Array(5).fill('')),
    currentRow: 0,
    currentCol: 0,
};

function update() {
    for (let i = 0; i < state.grid.length; i++) {
        for (let j = 0; j < state.grid[i].length; j++) {
            const box = document.getElementById(`box${i}${j}`); 
            box.textContent = state.grid[i][j];
        }
    }
}

function drawBox(container, row, col, alpha = '') {
    const box = document.createElement('div');
    box.className = 'box';
    box.id = `box${row}${col}`;
    box.textContent = alpha;

    container.appendChild(box);
    return box;
}

function drawGrid(container) { // Add container parameter
    const grid = document.createElement('div');
    grid.className = 'grid';

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            drawBox(grid, i, j); // Pass a default or specific alpha if needed
        }
    }
    container.appendChild(grid); // Append to the passed container
}

function getCurrentWord()
{
    return state.grid[state.currentRow].reduce((accumulator, currentValue) => accumulator + currentValue);
}

function isWordValid(word)
{
    console.log(word);
    return dictionary.includes(word);
}

function revealWord(word)
{
    const row=state.currentRow;
    const animation_duration = 500;

    for(let i=0; i<5;i++)
    {
        const box=document.getElementById(`box${row}${i}`);
        const letter=box.textContent;

        setTimeout(() => {
            if (letter===state.secret[i])
        {
            box.classList.add('right');
        }
        else if (state.secret.includes(letter))
        {
            box.classList.add('wrong');
        }
        else{
            box.classList.add('empty');
        }
        },((i+1)*animation_duration)/2);
        

        box.classList.add('animated');
        box.style.animationDelay=`${(i*animation_duration)/2}ms`;
    }

    const isWinner = state.secret===word;
    const isGameOver=state.currentRow===5;

    setTimeout(() => {
        if (isWinner)
    {
        alert('Congratulations!');

    }
    else if (isGameOver)
    {
        alert(`Too Bad! The word was ${state.secret}.`);
    }   
    },3*animation_duration);
}

function removeLetter()
{
    if (state.currentCol===0)return;
    state.grid[state.currentRow][state.currentCol-1]='';
    state.currentCol--;
}

function isLetter(key)
{
    return key.length === 1&&key.match(/[a-z]/i);
}

function addLetter(key)
{
    if (state.currentCol===5) return;
    state.grid[state.currentRow][state.currentCol]=key;
    state.currentCol++;
}



function register()
{
    document.body.onkeydown=(e)=>{
        const key=e.key;
        if (key==='Enter')
        {
            if(state.currentCol===5)
            {
                const word=getCurrentWord();
                if (isWordValid(word)){
                    revealWord(word);
                    state.currentRow++;
                    state.currentCol=0;
                }
                else
                {
                    alert('Not a valid word');
                }
            }
        }
        if (key==='Backspace')
        {
            removeLetter();
        }
        if (isLetter(key))
        {
            addLetter(key);
        }
        update();
    };
}

function revealAnswer() {
    // Fill the current row with the secret word
    const secretArray = state.secret.toLowerCase().split(''); // Assuming the secret is stored in uppercase
    for (let i = 0; i < secretArray.length; i++) {
        state.grid[state.currentRow][i] = secretArray[i];
        document.getElementById(`box${state.currentRow}${i}`).textContent = secretArray[i];
    }
    state.currentCol = 5; // Set this to the word's length to simulate a full row

    // Simulate pressing Enter
    const word = getCurrentWord();
    if (isWordValid(word)) {
        revealWord(word);
        state.currentRow++;
        state.currentCol = 0;
        if (state.currentRow < state.grid.length) {
            // Prepare for next row if game is not over
            state.currentRow++;
            state.currentCol = 0;
        }
    }
    update(); // Update the grid to reflect the new state
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Attach the click event listener to the "Reveal Answer" button
    document.getElementById('reveal-answer').addEventListener('click', revealAnswer);
});

// ... Your existing code ...

// Function to toggle dark/light mode
function toggleMode() {
    const bodyStyles = window.getComputedStyle(document.body);
    const isDarkMode = bodyStyles.getPropertyValue('--background') === bodyStyles.getPropertyValue('--background-dark');
    
    document.body.style.setProperty('--background', isDarkMode ? 'var(--background-light)' : 'var(--background-dark)');
    document.body.style.setProperty('--text-color', isDarkMode ? 'var(--text-color-light)' : 'var(--text-color-dark)');
    document.body.style.setProperty('--empty', isDarkMode ? 'var(--empty-light)' : 'var(--empty-dark)');
    document.body.style.setProperty('--wrong', isDarkMode ? 'var(--wrong-light)' : 'var(--wrong-dark)');
    document.body.style.setProperty('--right', isDarkMode ? 'var(--right-light)' : 'var(--right-dark)');
    
    // Update the colors of the boxes as well if needed
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(box => {
        box.style.borderColor = isDarkMode ? 'var(--empty-light)' : 'var(--empty-dark)';
        box.style.color = isDarkMode ? 'var(--text-color-light)' : 'var(--text-color-dark)';
    });
}

// The startup function is called once after the DOM content has loaded
function startup() {
    const game = document.getElementById('game');
    drawGrid(game);
    register();

    loadDictionary().then(setSecretWord).catch(error => {
        console.error('Failed to load dictionary:', error);
    });

    // Attach event listeners
    const modeToggleButton = document.getElementById('mode-toggle');
    if (modeToggleButton) {
        modeToggleButton.addEventListener('click', toggleMode);
    }
    
    const revealAnswerButton = document.getElementById('reveal-answer');
    if (revealAnswerButton) {
        revealAnswerButton.addEventListener('click', revealAnswer);
    }
}

// Call the startup function after the DOM has fully loaded
document.addEventListener('DOMContentLoaded', startup);
