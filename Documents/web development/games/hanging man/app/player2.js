
    const difficultySettings = {
      easy: { time: 15, maxLength: 5 },
      medium: { time: 10, minLength: 6, maxLength: 7 },
      hard: { time: 5, minLength: 8 }
    };

    const hangmanParts = [
      { type: 'circle', cx: 150, cy: 50, r: 20, stroke: 'black', strokeWidth: 4, fill: 'none' },
      { type: 'circle', cx: 150, cy: 90, r: 30, stroke: 'black', strokeWidth: 4, fill: 'none' },
      { type: 'line', x1: 150, y1: 120, x2: 100, y2: 150, stroke: 'black', strokeWidth: 4 },
      { type: 'line', x1: 150, y1: 120, x2: 200, y2: 150, stroke: 'black', strokeWidth: 4 },
      { type: 'line', x1: 150, y1: 160, x2: 120, y2: 220, stroke: 'black', strokeWidth: 4 },
      { type: 'line', x1: 150, y1: 160, x2: 180, y2: 220, stroke: 'black', strokeWidth: 4 },
      { type: 'line', x1: 150, y1: 50, x2: 150, y2: 70, stroke: 'red', strokeWidth: 4 }
    ];

    let word = '';
    let guessedLetters = [];
    let wrongGuesses = 0;
    let wins = 0;
    let losses = 0;
    let points = 0;
    let hintUsed = false;
    let player1Name = '';
    let player2Name = '';
    let setter = '';
    let guesser = '';
    let timerInterval = null;
    let timeLeft = 0;
    let currentDifficulty = 'easy';

    function startTimer(minutes) {
      clearInterval(timerInterval);
      timeLeft = minutes * 60;
      updateTimer();
      timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          document.getElementById('status').textContent = `😞 Time's Up! The word was: ${word}`;
          document.getElementById('status').className = 'status-lose';
          losses++;
          points -= 5;
          updateGameStats();
          document.getElementById('replay').classList.remove('hidden');
          document.getElementById('hint').disabled = true;
          updateAlphabet();
          showReport(setter);
        }
      }, 1000);
    }

    function updateTimer() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function updateGameStats() {
      const pointsElement = document.getElementById('points');
      const winsElement = document.getElementById('wins');
      const lossesElement = document.getElementById('losses');
      if (pointsElement && winsElement && lossesElement) {
        pointsElement.textContent = points;
        winsElement.textContent = wins;
        lossesElement.textContent = losses;
      } else {
        console.error('Game stats elements not found');
      }
    }

    function showReport(winner) {
      const report = document.getElementById('report');
      const game = document.getElementById('game');
      if (report && game) {
        game.classList.add('hidden');
        report.classList.remove('hidden');
        document.getElementById('report-player1').textContent = player1Name || 'Player 1';
        document.getElementById('report-player2').textContent = player2Name || 'Player 2';
        document.getElementById('report-winner').textContent = winner || 'None';
        document.getElementById('report-wins').textContent = wins;
        document.getElementById('report-losses').textContent = losses;
        document.getElementById('report-points').textContent = points;
      } else {
        console.error('Report or game elements not found');
      }
    }

    function initializeGame() {
      player1Name = document.getElementById('player1-name').value || 'Player 1';
      player2Name = document.getElementById('player2-name').value || 'Player 2';
      const role = document.getElementById('role-select').value;
      setter = role === 'player1' ? player1Name : player2Name;
      guesser = role === 'player1' ? player2Name : player1Name;
      const setterName = document.getElementById('setter-name');
      const playerDisplay = document.getElementById('player-display');
      const difficultyDisplay = document.getElementById('difficulty-display');
      const difficultyWordInput = document.getElementById('difficulty-word-input');
      const lengthRequirement = document.getElementById('length-requirement');
      if (setterName && playerDisplay && difficultyDisplay && difficultyWordInput && lengthRequirement) {
        setterName.textContent = setter;
        playerDisplay.textContent = guesser;
        currentDifficulty = 'easy';
        difficultyDisplay.textContent = 'Easy';
        difficultyWordInput.textContent = 'Easy';
        lengthRequirement.textContent = 'up to 5 letters';
        document.getElementById('setup').classList.add('hidden');
        document.getElementById('word-input').classList.remove('hidden');
      } else {
        console.error('Initialization elements not found');
      }
    }

    function startNewLevel() {
      const settings = difficultySettings[currentDifficulty];
      word = document.getElementById('custom-word').value.toUpperCase().replace(/[^A-Z]/g, '');
      if (!word || word.length < 3) {
        alert('Please enter a valid word (at least 3 letters, A-Z only).');
        return;
      }
      if (
        (currentDifficulty === 'easy' && word.length > settings.maxLength) ||
        (currentDifficulty === 'medium' && (word.length < settings.minLength || word.length > settings.maxLength)) ||
        (currentDifficulty === 'hard' && word.length < settings.minLength)
      ) {
        alert(`Word length must match difficulty: Easy (≤${settings.maxLength}), Medium (${settings.minLength}-${settings.maxLength}), Hard (≥${settings.minLength})`);
        return;
      }
      guessedLetters = [];
      wrongGuesses = 0;
      hintUsed = false;
      document.getElementById('status').textContent = '';
      document.getElementById('replay').classList.add('hidden');
      document.getElementById('hint').disabled = false;
      document.getElementById('word-input').classList.add('hidden');
      document.getElementById('game').classList.remove('hidden');
      startTimer(settings.time);
      updateWordDisplay();
      updateAlphabet();
      updateHangman();
    }

    function updateWordDisplay() {
      const wordDisplay = document.getElementById('word-display');
      if (wordDisplay) {
        const display = word.split('').map(letter => guessedLetters.includes(letter) ? letter : '_').join(' ');
        wordDisplay.textContent = display;
      } else {
        console.error('Word display element not found');
      }
    }

    function updateAlphabet() {
      const alphabetContainer = document.getElementById('alphabet');
      if (alphabetContainer) {
        alphabetContainer.innerHTML = '';
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
          const button = document.createElement('button');
          button.textContent = letter;
          button.setAttribute('aria-label', `Guess letter ${letter}`);
          button.className =
            guessedLetters.includes(letter) && word.includes(letter) ? 'correct' :
            guessedLetters.includes(letter) && !word.includes(letter) ? 'incorrect' :
            !guessedLetters.includes(letter) && !document.getElementById('status').textContent && timeLeft > 0 ? '' : 'disabled';
          button.disabled = guessedLetters.includes(letter) || document.getElementById('status').textContent || timeLeft <= 0;
          button.addEventListener('click', () => handleGuess(letter));
          alphabetContainer.appendChild(button);
        });
      } else {
        console.error('Alphabet container not found');
      }
    }

    function updateHangman() {
      const svg = document.getElementById('hangman');
      if (svg) {
        while (svg.children.length > 3) svg.removeChild(svg.lastChild);
        for (let i = 0; i < wrongGuesses; i++) {
          const part = hangmanParts[i];
          const element = document.createElementNS('http://www.w3.org/2000/svg', part.type);
          for (const [key, value] of Object.entries(part)) {
            if (key !== 'type') element.setAttribute(key, value);
          }
          element.classList.add('animate-draw');
          svg.appendChild(element);
        }
      } else {
        console.error('Hangman SVG not found');
      }
    }

    function handleGuess(letter) {
      if (guessedLetters.includes(letter) || document.getElementById('status').textContent || timeLeft <= 0) return;
      guessedLetters.push(letter);
      if (!word.includes(letter)) {
        wrongGuesses++;
        updateHangman();
        if (wrongGuesses >= 7) {
          clearInterval(timerInterval);
          document.getElementById('status').textContent = `😞 Game Over! The word was: ${word}`;
          document.getElementById('status').className = 'status-lose';
          losses++;
          points -= 5;
          updateGameStats();
          showReport(setter);
          document.getElementById('replay').classList.remove('hidden');
        }
      } else if (word.split('').every(letter => guessedLetters.includes(letter))) {
        clearInterval(timerInterval);
        document.getElementById('status').textContent = '🎉 Congratulations! You guessed the word!';
        document.getElementById('status').className = 'status-win';
        wins++;
        points += 10;
        updateGameStats();
        if (currentDifficulty === 'hard') {
          showReport(guesser);
        } else {
          if (currentDifficulty === 'easy') {
            currentDifficulty = 'medium';
            document.getElementById('difficulty-display').textContent = 'Medium';
            document.getElementById('difficulty-word-input').textContent = 'Medium';
            document.getElementById('length-requirement').textContent = '6-7 letters';
          } else if (currentDifficulty === 'medium') {
            currentDifficulty = 'hard';
            document.getElementById('difficulty-display').textContent = 'Hard';
            document.getElementById('difficulty-word-input').textContent = 'Hard';
            document.getElementById('length-requirement').textContent = '8 or more letters';
          }
          setTimeout(() => {
            document.getElementById('game').classList.add('hidden');
            document.getElementById('word-input').classList.remove('hidden');
            document.getElementById('custom-word').value = '';
          }, 1000);
        }
      }
      updateWordDisplay();
      updateAlphabet();
    }

    function handleHint() {
      if (hintUsed || document.getElementById('status').textContent || timeLeft <= 0) return;
      const unguessedLetters = word.split('').filter(letter => !guessedLetters.includes(letter));
      if (unguessedLetters.length > 0) {
        guessedLetters.push(unguessedLetters[0]);
        hintUsed = true;
        document.getElementById('hint').disabled = true;
        updateWordDisplay();
        updateAlphabet();
        if (word.split('').every(letter => guessedLetters.includes(letter))) {
          clearInterval(timerInterval);
          document.getElementById('status').textContent = '🎉 Congratulations! You guessed the word!';
          document.getElementById('status').className = 'status-win';
          wins++;
          points += 10;
          updateGameStats();
          if (currentDifficulty === 'hard') {
            showReport(guesser);
          } else {
            if (currentDifficulty === 'easy') {
              currentDifficulty = 'medium';
              document.getElementById('difficulty-display').textContent = 'Medium';
              document.getElementById('difficulty-word-input').textContent = 'Medium';
              document.getElementById('length-requirement').textContent = '6-7 letters';
            } else if (currentDifficulty === 'medium') {
              currentDifficulty = 'hard';
              document.getElementById('difficulty-display').textContent = 'Hard';
              document.getElementById('difficulty-word-input').textContent = 'Hard';
              document.getElementById('length-requirement').textContent = '8 or more letters';
            }
            setTimeout(() => {
              document.getElementById('game').classList.add('hidden');
              document.getElementById('word-input').classList.remove('hidden');
              document.getElementById('custom-word').value = '';
            }, 1000);
          }
        }
      }
    }

    document.getElementById('start-game').addEventListener('click', initializeGame);
    document.getElementById('submit-word').addEventListener('click', startNewLevel);
    document.getElementById('hint').addEventListener('click', handleHint);
    document.getElementById('back').addEventListener('click', () => {
      clearInterval(timerInterval);
      document.getElementById('game').classList.add('hidden');
      document.getElementById('setup').classList.remove('hidden');
    });
    document.getElementById('end-game').addEventListener('click', () => {
      clearInterval(timerInterval);
      document.getElementById('game').classList.add('hidden');
      document.getElementById('setup').classList.remove('hidden');
      wins = 0;
      losses = 0;
      points = 0;
      updateGameStats();
    });
    document.getElementById('replay').addEventListener('click', () => {
      clearInterval(timerInterval);
      document.getElementById('game').classList.add('hidden');
      document.getElementById('setup').classList.remove('hidden');
      const temp = setter;
      setter = guesser;
      guesser = temp;
      document.getElementById('role-select').value = setter === player1Name ? 'player1' : 'player2';
    });
    document.getElementById('close-report').addEventListener('click', () => {
      const report = document.getElementById('report');
      const setup = document.getElementById('setup');
      const roleSelect = document.getElementById('role-select');
      if (report && setup && roleSelect) {
        report.classList.add('hidden');
        setup.classList.remove('hidden');
        wins = 0;
        losses = 0;
        points = 0;
        updateGameStats();
        const temp = setter;
        setter = guesser;
        guesser = temp;
        roleSelect.value = setter === player1Name ? 'player1' : 'player2';
      } else {
        console.error('Close report elements not found');
      }
    });
