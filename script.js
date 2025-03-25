    const state = [
        {
          word: "apple",
          translation: "яблоко",
          example: "apples are rich with vitamin C",
        },
        {
          word: "cat",
          translation: "кошка",
          example: "my cat is very playful",
        },
        {
          word: "home",
          translation: "дом",
          example: "home is a place where you feel safe",
        },
        {
          word: "street",
          translation: "улица",
          example: "kids play on the street",
        },
        {
          word: "milk",
          translation: "молоко",
          example: "banana milk is so yummy",
        },
        {
          word: "socks",
          translation: "носки",
          example: "I love colorful socks",
        },
        {
          word: "sofa",
          translation: "диван",
          example: "yesterday I spilled coffee on my sofa",
        },
        {
          word: "popcorn",
          translation: "попкорн",
          example: "popcorn can be a healthy snack",
        },
      ];
      
      const statistics = {};
      
      let cards = [...state];
      
      const content = document.querySelector(".content");  // полностью прямоугольник квадрата с кнопками назад тест вперед
      const card = document.querySelector(".flip-card");  // квадратик
      const sliderControls = document.querySelector(".slider-controls"); // прямоугольник с кнопками назад тест вперед
      
      const currentWordCount = document.querySelector("#current-word");  // слово 1
      const totalWordsCount = document.querySelector("#total-word");   //   5
      
      const wordsProgress = document.querySelector("#words-progress");  // ползунок
      
      const shuffleWordsBtn = document.querySelector("#shuffle-words");  // кнопка перемешать слова
      
      const studyModeProgress = document.querySelector(".sidebar #study-mode");  //  слово 1 из 5 + ползунок + перемешать
      const examModeProgress = document.querySelector(".sidebar #exam-mode");   //  прогресс экзамена спрятано
      
      const timerEl = document.querySelector("#time"); // таймер
      const resultsModal = document.querySelector(".results-modal");  //  статистика спрятано
      
      const dictionary = {};    // пустой объект
      
      shuffleWordsBtn.addEventListener("click", () => {      // перемешать слова - обработчик
        shuffleArr(cards);
        renderCard(cards[idx]);
      });
      
      function shuffleArr(arr) {
        arr.sort(() => Math.random() - 0.5);   // перемешать карточки, выбрать рандомную
      }
      
      function prepareCard({ word, translation, example }) {   // переворачиваем по клику
        renderCard({ word, translation, example });
        card.addEventListener("click", (event) => {
          event.currentTarget.classList.toggle("active");
        });
      }
      
      function renderCard({ word, translation, example }) {    // отрисовать карточку
        card.querySelector("#card-front h1").textContent = word;
        card.querySelector("#card-back h1").textContent = translation;
        card.querySelector("#card-back p span").textContent = example;
      }
      
      function prepareSideBar() {    // менять цифры сбоку
        currentWordCount.textContent = idx + 1;
        totalWordsCount.textContent = cards.length;
      }
      
      let idx = 0;
      let selectedWord = null;
      let timerId = null;
      
      function init() {
        prepareCard(cards[idx]);
        prepareSideBar(idx);
        handleProgress(idx);
        fillDictionary();
      }
      
      init();
      
      function fillDictionary() {
        cards.forEach((item) => {
          dictionary[item.word] = item.translation;  // запись по ключу?
          dictionary[item.translation] = item.word;
        });
      }
      
      function handleControls(idx) {   // управление кнопками назад вперед
        const nextControl = sliderControls.querySelector("#next");
        const prevControl = sliderControls.querySelector("#back");
      
        nextControl.disabled = idx === cards.length - 1; // кнопка блокируется если последнее слово
        prevControl.disabled = idx === 0;  // кнопка блокируется если первое слово
      
        handleProgress(idx);
      }
      
      function handleProgress(idx) {    // двигаем ползунок
        currentWordCount.textContent = idx + 1;
        const progress = ((idx + 1) / cards.length) * 100;
        wordsProgress.value = Math.ceil(progress);   // значение ползунка равно округленному к целому числу значения progress
      }
      
      sliderControls.addEventListener("click", (event) => {    // обработчик на кнопки
        switch (event.target.id) {
          case "back":
            if (idx - 1 >= 0) {
              renderCard(cards[--idx]);
              handleControls(idx);
            }
            break;
          case "next":
            if (idx + 1 < cards.length) {
              renderCard(cards[++idx]);
              handleControls(idx);
            }
            break;
          case "exam":
            startExamMode();
            break;
        }
      });
      
      const examCardsContainer = document.querySelector("#exam-cards");
      
      function startExamMode() {
        card.classList.add("hidden");
        sliderControls.classList.add("hidden");
      
        examModeProgress.classList.remove("hidden");
        studyModeProgress.classList.add("hidden");
      
        renderExamCards();
        startTimer();
      }
      
      function renderExamCards() {
        const fragment = new DocumentFragment();
        const arr = [];
        cards.forEach((item) => {
          const [question, answer] = [
            makeExamCard(item.word, true),
            makeExamCard(item.translation),
          ];
          arr.push(question, answer);
        });
      shuffleArr(arr);
        fragment.append(...arr);
      
        examCardsContainer.innerHTML = "";
        examCardsContainer.append(fragment);
      }
      
      function makeExamCard(word, isOriginal = false) {
        const card = document.createElement("div");
        card.classList.add("card");
        card.textContent = word;
      
        card.addEventListener("click", function () {
          if (this.classList.contains('fade-out')) {
            return;
          }
          if (!selectedWord) {
            selectedWord = this.textContent;
            this.classList.add("correct");
          } else {
            setStatistics(word, isOriginal);
            if (dictionary[this.textContent] === selectedWord) {
              this.classList.add("correct");
              removeCorrectCards();
            } else {
              this.classList.add("wrong");
              resetCards();
            }
            selectedWord = null;
          }
      
          trackProgress();
          checkProgress();
        });
      
        return card;
      }
      
      const correctAnswered = document.querySelector("#correct-percent");
      const examProgress = document.querySelector("#exam-progress");
      function trackProgress() {
        const diff = state.length - cards.length;
        const progress = (diff / state.length) * 100;
        correctAnswered.textContent = `${progress.toFixed()}%`;
        examProgress.value = progress;
      }
      
      function removeCorrectCards() {
        const correctCards = document.querySelectorAll(".correct");
        const texts = [...correctCards].map((it) => it.textContent);
        for (let card of correctCards) {
          card.classList.add("fade-out");
        }
        texts.forEach((it) => {
          const idx = cards.findIndex((el) => el.word === it);
          if (idx >= 0) {
            cards.splice(idx, 1);
          }
        });
      }
      
      function setStatistics(word, isOriginal) {
        let key = word;
        if (!isOriginal) {
          key = cards.find((it) => it.translation === word).word;
        }
        statistics[key] = ++statistics[key] || 1;
      }
      
      function resetCards() {
        const correctCards = document.querySelectorAll(".correct");
        const inCorrectCards = document.querySelectorAll(".wrong");
      
        setTimeout(() => {
          [...correctCards, ...inCorrectCards].forEach((card) => {
            if (!card.classList.contains("fade-out")) {
              card.className = "card";
            }
          });
        }, 500);
      }
      
      function checkProgress() {
        if (cards.length === 0) {
          setTimeout(() => {
            clearInterval(timerId);
            showModal();
          }, 100);
        }
      }
      
      function showModal() {
        const wordStatTemplate = document.querySelector("#word-stats");
        const modalContent = resultsModal.querySelector(".results-content");
        const fragment = new DocumentFragment();
        Object.entries(statistics).forEach(([word, attempts]) => {
          const wordStat = wordStatTemplate.content.cloneNode(true);
          wordStat.querySelector(".word span").textContent = word;
          wordStat.querySelector(".attempts span").textContent = attempts;
          fragment.append(wordStat);
        });
        modalContent.append(fragment);
        resultsModal.querySelector(".time").textContent = timerEl.textContent;
        resultsModal.classList.remove("hidden");
      }
      
      function startTimer() {
        timerId = setInterval(() => {
          let [minutes, seconds] = timerEl.textContent.split(":").map(Number);
          if (seconds < 59) {
            seconds++;
          } else {
            minutes++;
            seconds = 0;
          }
          timerEl.textContent = `${format(minutes)}:${format(seconds)}`;
        }, 1000);
      }
      
      function format(val) {
        if (val < 10) {
          return 0`${val}`;
        }
        return val;
      }