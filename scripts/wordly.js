let [letters, loading, brand, resultWrapper, showWordWrapper, sw] = [document.querySelectorAll('.letters'), document.querySelector('.loading'), document.querySelector('.brand'),document.querySelector('.result-wrapper'),document.querySelector('.show-word-wrapper'), document.querySelector('.show-word')];

const ANSWER_LENGHT = 5;
const ROWS = 6;
let done = false;
let Word = '';

for (let index = 0; index <letters.length; index++) {
    letters[index].classList.add('letters-animation');
}

async function init() {
    let currentGuess = '';
    let row = 0;
    let wordParts = [];
    let loading = true;
    let wordMaps = {};

    const words = await fetch('https://words.dev-apis.com/word-of-the-day?word=random');
    let { word } = await words.json();
    word = word.toUpperCase();
    Word = word;
    // console.log('hello');
    isLoading(false);
    loading = false;
    wordParts = word.split('');
    wordMaps = wordMap(wordParts);

    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGHT) {
            currentGuess += letter;
        }
        else {
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }
        letters[ANSWER_LENGHT * row + currentGuess.length - 1].textContent = letter;
    }



    async function commit() {
        if(currentGuess.length < ANSWER_LENGHT) {
            return;
        }
        loading = true;
        isLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess }),
        });
        const { validWord } = await res.json();
        loading = false;
        isLoading(false);
        if(!validWord){
            markInvalidWord();
            return;
        }
        for(let i = 0; i < currentGuess.length; i++) {
            if(currentGuess[i] === wordParts[i] && wordMaps[currentGuess[i]] > 0) {
                letters[ANSWER_LENGHT * row + i].classList.add('correct');
                wordMaps[currentGuess[i]]--;
            }
            else if(wordParts.includes(currentGuess[i]) && wordMaps[currentGuess[i]] > 0) {
                letters[ANSWER_LENGHT * row + i].classList.add('close');
                wordMaps[currentGuess[i]]--;
            }
            else {
                letters[ANSWER_LENGHT * row + i].classList.add('wrong');
            }
        }
        if (currentGuess === word) {
            resultWrapper.classList.remove('result-wrapper-unvisible');
            resultWrapper.classList.add('result-wrapper-animation','result-wrapper-win');
            document.querySelector('.result').innerText = "You Win!";
            done = true;
            return;
        }
        currentGuess = '';
        row++;
        wordMaps = wordMap(wordParts);
        if(row > ROWS - 1) {
            resultWrapper.classList.remove('result-wrapper-unvisible');
            resultWrapper.classList.add('result-wrapper-animation','result-wrapper-lose');
            document.querySelector('.result').innerText = "You Lose!";
            showWordWrapper.classList.add('show-word-wrapper-unvisible');
            done = true;
            return;
        }
    }
    const markInvalidWord = () => {
        for(let i = 0; i < currentGuess.length; i++) {
            letters[ANSWER_LENGHT * row + i].classList.add('invalid');
        }

        setTimeout(() => {
            for(let i = 0; i < currentGuess.length; i++) {
                letters[ANSWER_LENGHT * row + i].classList.remove('invalid');
            }
        }
        , 1000);

    }
    function backspace() {
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.substring(0, currentGuess.length - 1);
            letters[ANSWER_LENGHT * row + currentGuess.length].textContent = '';
        }
    }
    document.addEventListener('keydown', event => {
        if(!done && !loading) {
            let action = event.key;
            if (action === 'Enter'){
                commit();
            }
            else if (action === 'Backspace'){
                backspace();
            }
            else if (isLetter(action)){
                addLetter(action.toUpperCase());
            }
            else {
                // do nothing
            }
        }
    });
}

const isLetter = char => /^[a-zA-Z]$/.test(char);
const wordMap = array => {
    // convert array into object
    return array.reduce((obj, item) => {
        obj[item] = (obj[item] || 0) + 1;
        return obj;
    }, {});
}
const isLoading = load => loading.classList.toggle('hide-loading', !load);

function showWord(){
    showWordWrapper.classList.add('sw-flip');
    sw.innerText = Word;
}

init();