
      const wordLists = {
        fruits: [], // Will be populated by API
        vegetables: ['CARROT', 'POTATO', 'TOMATO', 'BROCCOLI', 'SPINACH', 'CUCUMBER', 'PEPPER', 'ONION'],
        animals: ['TIGER', 'ELEPHANT', 'GIRAFFE', 'ZEBRA', 'PANDA', 'KANGAROO', 'DOLPHIN', 'WOLF'],
        others: ['SUNSHINE', 'MOUNTAIN', 'RIVER', 'FOREST', 'CAMPFIRE', 'STARLIGHT', 'RAINBOW', 'CLOUD']
      };

      const fallbackFruits = ['APPLE', 'BANANA', 'ORANGE', 'MANGO', 'KIWI', 'PINEAPPLE', 'STRAWBERRY', 'BLUEBERRY'];

      let word = '';
      let guessedLetters = [];
      let wrongGuesses = 0;
      let wins = 0;
      let losses = 0;
      let points = 0;
      let hintUsed = false;
      let playerName = '';
      let timerInterval = null;
      let timeLeft = 0;
      let currentDifficulty = 'easy';
      let currentCategory = 'fruits';

      const difficultySettings = {
        easy: { time: 15, maxLength: 5 },
        medium: { time: 10, minLength: 6, maxLength: 7 },
        hard: { time: 5, minLength: 8 }
      };

      const hangmanParts = [
        { type: 'circle', cx: 150, cy: 50, r: 20, stroke: 'black', strokeWidth: 4, fill: 'none' }, // Cap
        { type: 'circle', cx: 150, cy: 90, r: 30, stroke: 'black', strokeWidth: 4, fill: 'none' }, // Head
        { type: 'line', x1: 150, y1: 120, x2: 100, y2: 150, stroke: 'black', strokeWidth: 4 }, // Left arm
        { type: 'line', x1: 150, y1: 120, x2: 200, y2: 150, stroke: 'black', strokeWidth: 4 }, // Right arm
        { type: 'line', x1: 150, y1: 160, x2: 120, y2: 220, stroke: 'black', strokeWidth: 4 }, // Left leg
        { type: 'line', x1: 150, y1: 160, x2: 180, y2: 220, stroke: 'black', strokeWidth: 4 }, // Right leg
        { type: 'line', x1: 150, y1: 50, x2: 150, y2: 70, stroke: 'red', strokeWidth: 4 }, // Rope
      ];

      async function fetchFruits() {
        try {
          const response = await fetch('https://www.fruityvice.com/api/fruit/all');
          const data = await response.json();
          wordLists.fruits = data.map(fruit => fruit.name.toUpperCase().replace(/[^A-Z]/g, '')).filter(word => word.length >= 3);
          if (wordLists.fruits.length === 0) throw new Error('No valid fruits found');
        } catch (error) {
          console.error('Failed to fetch fruits, using fallback list:', error);
          wordLists.fruits = fallbackFruits;
        }
      }

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
          }
        }, 1000);
      }

      function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }

      function updateGameStats() {
        document.getElementById('points').textContent = points;
        document.getElementById('wins').textContent = wins;
        document.getElementById('losses').textContent = losses;
      }

      function showReport() {
        document.getElementById('game').classList.add('hidden');
        document.getElementById('report').classList.remove('hidden');
        document.getElementById('report-player').textContent = playerName;
        document.getElementById('report-wins').textContent = wins;
        document.getElementById('report-losses').textContent = losses;
        document.getElementById('report-points').textContent = points;
      }

      async function initializeGame() {
        await fetchFruits(); // Fetch fruits before starting
        playerName = document.getElementById('player-name').value || 'Player';
        currentCategory = document.getElementById('category').value;
        document.getElementById('player-display').textContent = playerName;
        currentDifficulty = 'easy';
        document.getElementById('difficulty-display').textContent = 'Easy';
        startNewLevel();
        document.getElementById('setup').classList.add('hidden');
        document.getElementById('game').classList.remove('hidden');
      }

      function startNewLevel() {
        const settings = difficultySettings[currentDifficulty];
        const words = wordLists[currentCategory].filter(word => {
          if (currentDifficulty === 'easy') return word.length <= settings.maxLength;
          if (currentDifficulty === 'medium') return word.length >= settings.minLength && word.length <= settings.maxLength;
          return word.length >= settings.minLength;
        });

        word = words[Math.floor(Math.random() * words.length)] || fallbackFruits[Math.floor(Math.random() * fallbackFruits.length)];
        guessedLetters = [];
        wrongGuesses = 0;
        hintUsed = false;
        document.getElementById('status').textContent = '';
        document.getElementById('replay').classList.add('hidden');
        document.getElementById('hint').disabled = false;
        startTimer(settings.time);
        updateWordDisplay();
        updateAlphabet();
        updateHangman();
      }

      function updateWordDisplay() {
        const display = word.split('').map(letter => guessedLetters.includes(letter) ? letter : '_').join(' ');
        document.getElementById('word-display').textContent = display;
      }

      function updateAlphabet() {
        const alphabetContainer = document.getElementById('alphabet');
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
      }

      function updateHangman() {
        const svg = document.getElementById('hangman');
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
            setTimeout(showReport, 1000);
          } else {
            if (currentDifficulty === 'easy') {
              currentDifficulty = 'medium';
              document.getElementById('difficulty-display').textContent = 'Medium';
            } else if (currentDifficulty === 'medium') {
              currentDifficulty = 'hard';
              document.getElementById('difficulty-display').textContent = 'Hard';
            }
            setTimeout(startNewLevel, 1000);
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
              setTimeout(showReport, 1000);
            } else {
              if (currentDifficulty === 'easy') {
                currentDifficulty = 'medium';
                document.getElementById('difficulty-display').textContent = 'Medium';
              } else if (currentDifficulty === 'medium') {
                currentDifficulty = 'hard';
                document.getElementById('difficulty-display').textContent = 'Hard';
              }
              setTimeout(startNewLevel, 1000);
            }
          }
        }
      }

      document.getElementById('start-game').addEventListener('click', initializeGame);
      document.getElementById('hint').addEventListener('click', handleHint);
      document.getElementById('back').addEventListener('click', () => {
        clearInterval(timerInterval);
        document.getElementById('game').classList.add('hidden');
        document.getElementById('setup').classList.remove('hidden');
      });
      document.getElementById('back-to-menu').addEventListener('click', () => {
        window.location.href = 'index.html';
      });
      document.getElementById('end-game').addEventListener('click', () => {
        clearInterval(timerInterval);
        showReport();
      });
      document.getElementById('replay').addEventListener('click', () => {
        clearInterval(timerInterval);
        document.getElementById('game').classList.add('hidden');
        document.getElementById('setup').classList.remove('hidden');
      });
      document.getElementById('close-report').addEventListener('click', () => {
        document.getElementById('report').classList.add('hidden');
        document.getElementById('setup').classList.remove('hidden');
        wins = 0;
        losses = 0;
        points = 0;
        updateGameStats();
      });