window.initializeSlideEvents = function () {
    const container = document.querySelector('.slider_container');
    const slides = container?.querySelector('.slides');
    const slideElements = slides?.querySelectorAll(':scope > div') || [];

    if (container && slides && slideElements.length > 0) {
        let currentIndex = 0;
        let startY = 0;
        let isDragging = false;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID;

        container.addEventListener('touchstart', start, { passive: true });
        container.addEventListener('touchmove', move, { passive: true });
        container.addEventListener('touchend', end);
        container.addEventListener('mousedown', start);
        container.addEventListener('mousemove', move);
        container.addEventListener('mouseup', end);

        function start(event) {
            isDragging = true;
            startY = getY(event);
            animationID = requestAnimationFrame(animation);
        }

        function move(event) {
            if (!isDragging) return;
            const currentY = getY(event);
            currentTranslate = prevTranslate + currentY - startY;
        }

        function end() {
            cancelAnimationFrame(animationID);
            isDragging = false;
            const movedBy = currentTranslate - prevTranslate;
            const threshold = 100;

            if (movedBy < -threshold && currentIndex < slideElements.length - 1) currentIndex++;
            else if (movedBy > threshold && currentIndex > 0) currentIndex--;

            setPositionByIndex();
        }

        function animation() {
            setSliderPosition();
            if (isDragging) requestAnimationFrame(animation);
        }

        function setSliderPosition() {
            slides.style.transform = `translateY(${currentTranslate}px)`;
        }

        function setPositionByIndex() {
            const slideHeight = slideElements[0].offsetHeight;
            const computedStyle = window.getComputedStyle(slideElements[0]);
            const marginTop = parseInt(computedStyle.marginTop) || 0;
            const marginBottom = parseInt(computedStyle.marginBottom) || 0;
            const marginGap = marginTop * 2 + marginBottom - 10;
            currentTranslate = -currentIndex * (slideHeight + marginGap);
            prevTranslate = currentTranslate;

            slides.style.transition = 'transform 0.4s ease-in-out';
            setSliderPosition();

            setTimeout(() => {
                slides.style.transition = '';
            }, 400);
        }

        function getY(event) {
            return event.type.includes('mouse') ? event.clientY : event.touches[0].clientY;
        }

        /** 🔊 사운드 버튼 **/
        const soundButtons = slides.querySelectorAll('button.sound');
        soundButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                alert("예문을 읽습니다.");
            });
        });

        /** 📝 퀴즈 제출 **/
        const quizButtons = slides.querySelectorAll('.quiz-submit');
        quizButtons.forEach((btn) => {
            btn.addEventListener('click', handleQuizSubmit);
        });

        /** ⌨️ 퀴즈 Enter 키 처리 **/
        const quizInputs = slides.querySelectorAll('.quiz-input');
        quizInputs.forEach((input) => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();

                    const slide = input.closest('.slide_quiz');
                    const footer = slide.querySelector('.slide_footer');

                    if (!slide || footer.classList.contains('processing')) return;

                    const btn = slide.querySelector('.quiz-submit');
                    if (btn) btn.click();
                }
            });
        });

        /** ✅ 퀴즈 제출 처리 함수 **/
        function handleQuizSubmit(e) {
            const btn = e.currentTarget;
            const slide = btn.closest('.slide_quiz');
            if (!slide) return;

            const footer = slide.querySelector('.slide_footer');
            const input = slide.querySelector('.quiz-input');

            if (!input || footer.classList.contains('processing')) return;

            // ✅ 중복 처리 방지
            footer.classList.add('processing');

            const answer = input.dataset.answer?.trim() || '';
            const userAnswer = input.value.trim();

            const isCorrect = userAnswer.toLowerCase().includes(answer.toLowerCase());

            if (isCorrect) {
                alert("정답입니다!");

                const mainText = slide.querySelector('.slide_main_text') || slide.querySelector('.slide_video_main_text');
                const image = slide.querySelector('.slide_main_image');
                if (image) image.remove();

                const explanation = document.createElement('div');
                explanation.className = 'quiz-explanation';
                explanation.innerText = `✅ 정답은 "${answer}"입니다. 잘 하셨어요!`;

                if (mainText) mainText.appendChild(explanation);

                footer.style.display = 'none';
            } else {
                alert("정답이 아닙니다. 다시 시도해보세요.");
            }

            setTimeout(() => {
                footer.classList.remove('processing');
            }, 300);
        }
    } else {
        console.log("❌ 슬라이드 DOM이 없어서 이벤트 바인딩 생략");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    /** 홈 버튼 동작 (index.html 또는 home.html 등으로) **/
    const homeBtn = document.getElementById('home');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = 'index.html'; // 홈 페이지 경로에 맞게 수정
        });
    }

    /** 뒤로가기 버튼 동작 **/
    const backBtn = document.getElementById('back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
});