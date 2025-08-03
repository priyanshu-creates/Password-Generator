// DOM Elements
const inputSlider = document.querySelector("[data-lengthSlider]");
const lengthDisplay = document.querySelector("[data-lengthNumber]");
const passwordDisplay = document.querySelector("[data-passwordDisplay]");
const copyBtn = document.querySelector("[data-copy]");
const copyMsg = document.querySelector("[data-copyMsg]");
const uppercaseCheck = document.querySelector("#uppercase");
const lowercaseCheck = document.querySelector("#lowercase");
const numbersCheck = document.querySelector("#numbers");
const symbolsCheck = document.querySelector("#symbols");
const strengthText = document.querySelector("[data-strengthText]");
const strengthBars = document.querySelectorAll("[data-strengthBar]");
const generateBtn = document.querySelector("[data-generateBtn]");
const allCheckBox = document.querySelectorAll("input[type=checkbox]");

// Slider Elements
const minusBtn = document.querySelector("[data-minusBtn]");
const plusBtn = document.querySelector("[data-plusBtn]");

// Constants
const symbols = '~`!@#$%^&*()_-+={[}]|:;"<,>.?/';
const MIN_LENGTH = 1;
const MAX_LENGTH = 20;

// State
let password = "";
let passwordLength = 20;
let checkCount = 0;

// Initialize
handleSlider();
setStrengthIndicator("medium");

// Functions
function handleSlider() {
    inputSlider.value = passwordLength;
    lengthDisplay.innerText = passwordLength;
    updateSliderButtons();
}

function updateSliderButtons() {
    // Update button states
    minusBtn.disabled = passwordLength <= MIN_LENGTH;
    plusBtn.disabled = passwordLength >= MAX_LENGTH;
    
    // Update button styles based on disabled state
    if (minusBtn.disabled) {
        minusBtn.style.opacity = "0.5";
        minusBtn.style.cursor = "not-allowed";
    } else {
        minusBtn.style.opacity = "1";
        minusBtn.style.cursor = "pointer";
    }
    
    if (plusBtn.disabled) {
        plusBtn.style.opacity = "0.5";
        plusBtn.style.cursor = "not-allowed";
    } else {
        plusBtn.style.opacity = "1";
        plusBtn.style.cursor = "pointer";
    }
}

function setStrengthIndicator(strength) {
    const strengthConfig = {
        weak: {
            text: "WEAK",
            bars: 1,
            color: "weak"
        },
        medium: {
            text: "MEDIUM",
            bars: 3,
            color: "medium"
        },
        strong: {
            text: "STRONG",
            bars: 4,
            color: "strong"
        }
    };

    const config = strengthConfig[strength];
    
    // Update strength text
    strengthText.textContent = config.text;
    
    // Update strength bars
    strengthBars.forEach((bar, index) => {
        bar.classList.remove('filled', 'weak', 'medium', 'strong');
        
        if (index < config.bars) {
            bar.classList.add('filled', config.color);
        }
    });
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function generateRandomNumber() {
    return getRndInteger(0, 9);
}

function generateLowerCase() {
    return String.fromCharCode(getRndInteger(97, 123));
}

function generateUpperCase() {
    return String.fromCharCode(getRndInteger(65, 91));
}

function generateSymbol() {
    const randNum = getRndInteger(0, symbols.length);
    return symbols.charAt(randNum);
}

// Calculate password strength
function calcStrength() {
    let hasUpper = false;
    let hasLower = false;
    let hasNum = false;
    let hasSym = false;
    
    if (uppercaseCheck.checked) hasUpper = true;
    if (lowercaseCheck.checked) hasLower = true;
    if (numbersCheck.checked) hasNum = true;
    if (symbolsCheck.checked) hasSym = true;

    let strength = "weak";
    
    if (hasUpper && hasLower && (hasNum || hasSym) && passwordLength >= 8) {
        strength = "strong";
    } else if ((hasLower || hasUpper) && (hasNum || hasSym) && passwordLength >= 6) {
        strength = "medium";
    } else {
        strength = "weak";
    }
    
    setStrengthIndicator(strength);
}

// Copy to clipboard
async function copyContent() {
    try {
        await navigator.clipboard.writeText(passwordDisplay.value);
        copyMsg.innerText = "Copied!";
    } catch (e) {
        copyMsg.innerText = "Failed";
    }
    
    copyMsg.classList.add("active");
    
    setTimeout(() => {
        copyMsg.classList.remove("active");
    }, 2000);
}

// Shuffle password using Fisher-Yates method
function shufflePassword(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array.join("");
}

function handleCheckBoxChange() {
    checkCount = 0;
    allCheckBox.forEach((checkbox) => {
        if (checkbox.checked) checkCount++;
    });

    // Special condition: password length should be at least equal to number of selected options
    if (passwordLength < checkCount) {
        passwordLength = checkCount;
        handleSlider();
    }
    
    // Update strength when checkboxes change
    calcStrength();
}

// Event Listeners

// Slider input
inputSlider.addEventListener('input', (e) => {
    passwordLength = parseInt(e.target.value);
    handleSlider();
    calcStrength();
});

// Slider controls
minusBtn.addEventListener('click', () => {
    if (passwordLength > MIN_LENGTH) {
        passwordLength--;
        handleSlider();
        calcStrength();
    }
});

plusBtn.addEventListener('click', () => {
    if (passwordLength < MAX_LENGTH) {
        passwordLength++;
        handleSlider();
        calcStrength();
    }
});

// Copy button
copyBtn.addEventListener('click', () => {
    if (passwordDisplay.value) {
        copyContent();
    }
});

// Checkbox changes
allCheckBox.forEach((checkbox) => {
    checkbox.addEventListener('change', handleCheckBoxChange);
});

// Generate password
generateBtn.addEventListener('click', () => {
    // Check if at least one checkbox is selected
    if (checkCount === 0) {
        return;
    }

    // Ensure password length is at least equal to number of selected options
    if (passwordLength < checkCount) {
        passwordLength = checkCount;
        handleSlider();
    }

    // Clear previous password
    password = "";

    // Create array of selected functions
    let funcArr = [];

    if (uppercaseCheck.checked) funcArr.push(generateUpperCase);
    if (lowercaseCheck.checked) funcArr.push(generateLowerCase);
    if (numbersCheck.checked) funcArr.push(generateRandomNumber);
    if (symbolsCheck.checked) funcArr.push(generateSymbol);

    // Add one character from each selected type (compulsory)
    for (let i = 0; i < funcArr.length; i++) {
        password += funcArr[i]();
    }

    // Fill remaining length with random characters from selected types
    for (let i = 0; i < passwordLength - funcArr.length; i++) {
        let randIndex = getRndInteger(0, funcArr.length);
        password += funcArr[randIndex]();
    }

    // Shuffle the password
    password = shufflePassword(Array.from(password));

    // Display in UI
    passwordDisplay.value = password;

    // Calculate and display strength
    calcStrength();
});