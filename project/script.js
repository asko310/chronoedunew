import { db, collection, addDoc, getDocs, doc, getDoc, auth, signInWithEmailAndPassword } from './firebase.js';

// Crează un nou quiz
if (document.getElementById('quiz-form')) {
    const quizForm = document.getElementById('quiz-form');
    const questionsContainer = document.getElementById('questions-container');

    document.getElementById('add-question').addEventListener('click', () => {
        const questionDiv = document.createElement('div');
        questionDiv.innerHTML = `
            <label>Întrebare:</label>
            <input type="text" class="question-text" required>
            <label>Opțiuni (separate prin virgulă):</label>
            <input type="text" class="question-options" required>
            <label>Răspuns corect:</label>
            <input type="text" class="question-answer" required>
        `;
        questionsContainer.appendChild(questionDiv);
    });

    quizForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('quiz-title').value;
        const questions = [];
        document.querySelectorAll('#questions-container > div').forEach(div => {
            const question = div.querySelector('.question-text').value;
            const options = div.querySelector('.question-options').value.split(',');
            const answer = div.querySelector('.question-answer').value;
            questions.push({ question, options, answer });
        });

        try {
            await addDoc(collection(db, 'quizzes'), { title, questions });
            alert('Quiz salvat cu succes!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Eroare la salvarea quiz-ului:', error);
            alert('A apărut o eroare la salvarea quiz-ului.');
        }
    });
}

// Afișează quiz-urile disponibile
if (document.getElementById('quiz-list')) {
    const quizList = document.getElementById('quiz-list');

    const loadQuizzes = async () => {
        const querySnapshot = await getDocs(collection(db, 'quizzes'));
        querySnapshot.forEach(doc => {
            const quiz = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `<a href="take-quiz.html?id=${doc.id}">${quiz.title}</a>`;
            quizList.appendChild(li);
        });
    };

    loadQuizzes();
}

// Completează un quiz
if (document.getElementById('quiz-questions')) {
    const quizTitle = document.getElementById('quiz-title');
    const quizQuestions = document.getElementById('quiz-questions');
    const studentNameForm = document.getElementById('student-name-form');
    const startQuizButton = document.getElementById('start-quiz');
    const timerElement = document.getElementById('timer');
    const timeLeftElement = document.getElementById('time-left');
    const submitQuizButton = document.getElementById('submit-quiz');

    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');

    let timeLeft = 120; // 2 minute în secunde
    let timerInterval;

    // Ascunde întrebările și timerul la început
    quizQuestions.style.display = 'none';
    timerElement.style.display = 'none';

    // Încarcă quiz-ul
    const loadQuiz = async () => {
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        const quiz = quizDoc.data();
        quizTitle.textContent = quiz.title;

        quiz.questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.innerHTML = `
                <p>${q.question}</p>
                ${q.options.map(option => `
                    <label>
                        <input type="radio" name="question-${index}" value="${option}">
                        ${option}
                    </label>
                `).join('')}
            `;
            quizQuestions.appendChild(questionDiv);
        });
    };

    // Pornește timerul
    const startTimer = () => {
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timeLeftElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert('Timpul a expirat!');
                submitQuiz();
            }
        }, 1000);
    };

    // Trimite răspunsurile
    const submitQuiz = async () => {
        const studentName = document.getElementById('student-name').value;
        const answers = [];
        let score = 0;

        // Preluăm răspunsurile corecte din quiz
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        const quiz = quizDoc.data();
        const correctAnswers = quiz.questions.map(q => q.answer);

        // Verificăm răspunsurile elevului
        document.querySelectorAll('#quiz-questions input[type="radio"]:checked').forEach((input, index) => {
            answers.push(input.value);
            if (input.value === correctAnswers[index]) {
                score++;
            }
        });

        if (answers.length === 0) {
            alert('Nu ai selectat niciun răspuns!');
            return;
        }

        try {
            await addDoc(collection(db, 'responses'), {
                studentName,
                quizId,
                quizTitle: quiz.title, // Salvăm și titlul quiz-ului
                answers,
                score, // Salvăm scorul
                timestamp: new Date()
            });
            alert(`Răspunsurile au fost trimise! Scorul tău: ${score}/${quiz.questions.length}`);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Eroare la salvarea răspunsurilor:', error);
            alert('A apărut o eroare la trimiterea răspunsurilor.');
        }
    };

    // Ascunde formularul pentru nume și afișează quiz-ul
    startQuizButton.addEventListener('click', () => {
        const studentName = document.getElementById('student-name').value;
        if (!studentName) {
            alert('Introdu numele tău!');
            return;
        }

        studentNameForm.style.display = 'none';
        quizQuestions.style.display = 'block';
        timerElement.style.display = 'block';
        startTimer();
        loadQuiz();
    });

    submitQuizButton.addEventListener('click', submitQuiz);
}

// Autentificare pentru profesori
if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert('Autentificare reușită!');
            window.location.href = 'create-quiz.html';
        } catch (error) {
            console.error('Eroare la autentificare:', error);
            alert('Autentificare eșuată. Verifică emailul și parola.');
        }
    });
}

// Încarcă răspunsurile pentru profesori
if (document.getElementById('responses-list')) {
    const loadResponses = async () => {
        const querySnapshot = await getDocs(collection(db, 'responses'));
        const responsesList = document.getElementById('responses-list');
        responsesList.innerHTML = '';

        querySnapshot.forEach(doc => {
            const response = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>Quiz:</strong> ${response.quizTitle}<br>
                <strong>Elev:</strong> ${response.studentName}<br>
                <strong>Scor:</strong> ${response.score}
            `;
            responsesList.appendChild(li);
        });
    };

    loadResponses();
}