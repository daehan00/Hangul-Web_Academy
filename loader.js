async function loadSlidesFromJson(jsonPath, selectedWord) {
    try {
        const response = await fetch(jsonPath);
        console.log(response);
        const data = await response.json();

        const slidesContainer = document.querySelector(".slides");
        const titleEl = document.querySelector(".main_title");

        // ✅ 선택한 단어가 있으면 entries에서 찾고 없으면 전체 슬라이드 사용
        let slides = [];
        if (selectedWord && data.entries && Array.isArray(data.entries)) {
            const matchedEntry = data.entries.find(entry => entry.title === selectedWord);
            if (matchedEntry && matchedEntry.slides) {
                slides = matchedEntry.slides;
                if (titleEl) titleEl.textContent = matchedEntry.title;
            } else {
                console.warn("해당 단어에 대한 슬라이드가 없습니다.");
            }
        } else if (data.slides && Array.isArray(data.slides)) {
            slides = data.slides;
            if (titleEl && data.title) titleEl.textContent = data.title;
        } else {
            throw new Error("유효한 슬라이드 데이터를 찾을 수 없습니다.");
        }
        console.log("선택된 단어:", selectedWord);
        console.log("엔트리 제목 목록:", data.entries.map(e => e.title));

        slides.forEach(slide => {
            const slideEl = document.createElement("div");
            slideEl.classList.add(`slide_${slide.type}`, "slide");

            if (slide.subtitle) {
                const subtitleEl = document.createElement("div");
                subtitleEl.className = "slide_subtitle";
                subtitleEl.textContent = slide.subtitle;
                slideEl.appendChild(subtitleEl);
            }

            const main = document.createElement("div");
            main.className = "slide_main";

            if (slide.type === "image" && slide.image) {
                const imageBox = document.createElement("div");
                imageBox.className = "slide_main_image";
                const img = document.createElement("img");
                img.src = slide.image;
                imageBox.appendChild(img);
                main.appendChild(imageBox);
            }

            if (slide.type === "video" && slide.videoUrl) {
                const iframe = document.createElement("iframe");
                iframe.src = slide.videoUrl;
                iframe.allowFullscreen = true;
                iframe.width = "300";
                iframe.height = "150";
                iframe.frameBorder = "0";
                main.appendChild(iframe);
            }

            if (slide.text) {
                const textBox = document.createElement("div");
                textBox.className = slide.type === "video" ? "slide_video_main_text" : "slide_main_text";
                textBox.innerHTML = slide.text;
                main.appendChild(textBox);
            }

            if (slide.sound) {
                const soundBtn = document.createElement("button");
                soundBtn.className = "sound";
                const img = document.createElement("img");
                img.src = "images/megaphone.svg";
                soundBtn.appendChild(img);
                main.appendChild(soundBtn);
            }

            if (slide.type === "quiz") {
                const input = document.createElement("input");
                input.className = "quiz-input";
                input.setAttribute("data-answer", slide.answer);
                input.placeholder = "답을 입력하세요!";
                main.appendChild(input);

                const button = document.createElement("button");
                button.className = "quiz-submit";
                button.textContent = "제출";
                main.appendChild(button);
            }

            slideEl.appendChild(main);

            const footer = document.createElement("div");
            footer.className = "slide_footer";
            footer.textContent = "아래로 넘기세요";
            slideEl.appendChild(footer);

            slidesContainer.appendChild(slideEl);
        });
    } catch (err) {
        console.error("데이터 로딩 실패:", err);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // ✅ loader.js - JSON 기반으로 main.html의 슬라이드를 동적으로 생성 및 intro.html 이동 처리


    // ✅ intro.html에서 사용할 데이터 로딩
    async function loadIntroFromJson(jsonPath) {
        try {
            const response = await fetch(jsonPath);
            console.log(response);
            const data = await response.json();

            // 제목 설정
            const titleEl = document.querySelector('#title h1');
            if (titleEl && data.introTitle) {
                titleEl.innerHTML = data.introTitle;
            }

            // 설명 텍스트
            const infoEl = document.querySelector('.main_information h3');
            if (infoEl && data.introText) {
                infoEl.innerHTML = data.introText;
            }

            // 어휘 버튼 생성
            const mainWordBox = document.querySelector('.main_word');
            const extendWordBox = document.querySelector('.extend_word');

            data.words.main.forEach(word => {
                const btn = document.createElement('button');
                btn.className = 'word';
                btn.textContent = word;
                btn.addEventListener('click', () => {
                    window.location.href = `main.html?category=${data.category}&word=${word}`;
                });
                mainWordBox.appendChild(btn);
            });

            data.words.extend.forEach(word => {
                const btn = document.createElement('button');
                btn.className = 'word';
                btn.textContent = word;
                extendWordBox.appendChild(btn);
            });
        } catch (err) {
            console.error("인트로 데이터 로딩 실패:", err);
        }
    }

    // ✅ 공통 파라미터 수집
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") || "word";
    const word = params.get("word") || null;
    const jsonPath = `data/${category}.json`;

    // main.html용 로딩
    if (document.querySelector('.main_practice_page')) {
        loadSlidesFromJson(jsonPath, word);
    }

    // intro.html용 로딩
    if (document.querySelector('.intro_page')) {
        loadIntroFromJson(jsonPath);

        // 버튼 클릭 시 main으로 이동 처리
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('word')) {
                const selectedWord = e.target.textContent;
                window.location.href = `main.html?category=${category}&word=${encodeURIComponent(selectedWord)}`;
            }
        });
    }
    // 하드코딩된 버튼들에도 이벤트 리스너 부여
    document.querySelectorAll('.word').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedWord = e.target.dataset.word || e.target.textContent;
            window.location.href = `main.html?category=${category}&word=${encodeURIComponent(selectedWord)}`;
        });
    });
});

const slidesContainer = document.querySelector(".slides");

if (slidesContainer) {
    const observer = new MutationObserver((mutationsList, observer) => {
        const slideCount = slidesContainer.querySelectorAll(':scope > div').length;
        if (slideCount > 0 && typeof window.initializeSlideEvents === 'function') {
            console.log("🔍 슬라이드 감지 완료, 이벤트 바인딩");
            window.initializeSlideEvents();
            observer.disconnect(); // 중복 바인딩 방지
        }
    });

    observer.observe(slidesContainer, { childList: true });
}