document.addEventListener('DOMContentLoaded', () => {
    /** 슬라이드 동작 설정 **/
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
    }

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

    const soundButtons = document.querySelectorAll('button.sound');
    soundButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            alert("예문을 읽습니다.");
        });
    });

    const quizButtons = document.querySelectorAll('.quiz-submit');
    quizButtons.forEach((btn) => {
        btn.addEventListener('click', handleQuizSubmit);
    });

    const quizInputs = document.querySelectorAll('.quiz-input');
    quizInputs.forEach((input) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const footer = input.closest('.slide_footer');

                // ✅ 중복 처리 방지
                if (!footer || footer.classList.contains('processing')) return;

                const btn = footer.querySelector('.quiz-submit');
                if (btn) btn.click();
            }
        });
    });

    function handleQuizSubmit(e) {
        const btn = e.currentTarget;
        const footer = btn.closest('.slide_footer');
        if (!footer || footer.classList.contains('processing')) return;

        // ✅ 잠깐 processing 상태로 막음
        footer.classList.add('processing');

        const input = footer.querySelector('.quiz-input');
        const answer = input.dataset.answer?.trim() || '';
        const userAnswer = input.value.trim();

        const isCorrect = userAnswer.toLowerCase().includes(answer.toLowerCase());

        if (isCorrect) {
            alert("정답입니다!");

            const slide = btn.closest('.slide_quiz');
            const mainText = slide.querySelector('.slide_main_text');
            const image = slide.querySelector('.slide_main_image');
            if (image) image.remove();

            const explanation = document.createElement('div');
            explanation.className = 'quiz-explanation';
            explanation.innerText = `✅ 정답은 "${answer}"입니다. 잘 하셨어요!`;
            mainText.appendChild(explanation);

            footer.style.display = 'none';
        } else {
            alert("정답이 아닙니다. 다시 시도해보세요.");
        }

        // ✅ 처리 완료 후 상태 초기화
        setTimeout(() => {
            footer.classList.remove('processing');
        }, 300); // 0.3초 후 초기화
    }

    const buttons = document.querySelectorAll('.category-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.id + '.html';
            window.location.href = target;
        });
    });
});