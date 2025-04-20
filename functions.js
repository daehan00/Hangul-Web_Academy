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

    /** 단어 버튼 클릭 시 main.html 이동 **/
    const wordButtons = document.querySelectorAll('button.word');
    wordButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            window.location.href = 'main.html'; // main.html 경로에 맞게 설정
        });
    });
    const soundButtons = document.querySelectorAll('button.sound');
    soundButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            alert("예문을 읽습니다.");
        });
    });
});
