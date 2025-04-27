// ✅ loader.js - JSON 기반으로 main.html의 슬라이드를 동적으로 생성 및 intro.html 이동 처리

// ✅ loader.js - JSON 기반으로 main.html의 슬라이드를 동적으로 생성 및 intro.html 이동 처리

async function loadSlidesFromJson(jsonPath, selectedWord) {
    try {
        const response = await fetch(jsonPath);
        const data = await response.json();

        const slidesContainer = document.querySelector(".slides");
        const titleEl = document.querySelector(".main_title");

        const headerTitleEl = document.querySelector("#title h1");
        if (headerTitleEl && data.introTitle) {
            headerTitleEl.innerHTML = data.introTitle;
        }

        let slides = [];
        if (data.entries && Array.isArray(data.entries)) {
            if (!selectedWord) selectedWord = data.entries[0].title;
            const matchedEntry = data.entries.find(entry => entry.title === selectedWord);
            if (matchedEntry && matchedEntry.slides) {
                slides = matchedEntry.slides;
                if (titleEl) titleEl.textContent = matchedEntry.title;
            } else {
                throw new Error("선택된 단어의 슬라이드를 찾을 수 없습니다.");
            }
        } else if (data.slides && Array.isArray(data.slides)) {
            slides = data.slides;
            if (titleEl && data.title) titleEl.textContent = data.title;
        } else {
            throw new Error("유효한 슬라이드 데이터를 찾을 수 없습니다.");
        }

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

            if (slide.type === "image" || slide.image) {
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

            if (slide.text || slide.lines || slide.questions) {
                const textBox = document.createElement("div");
                textBox.className = slide.type === "video" ? "slide_video_main_text" : "slide_main_text";

                if (slide.text) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(`<div>${slide.text}</div>`, 'text/html');
                    const container = doc.body.firstChild;
                    textBox.appendChild(container);
                }

                if (slide.questions) {
                    slide.questions.forEach((q, idx) => {
                        const qEl = document.createElement("div");
                        qEl.className = "quiz-inline-text";
                        qEl.innerHTML = `${idx + 1}. ${q.text} ( )`;
                        textBox.appendChild(qEl);
                    });
                }

                main.appendChild(textBox);
            }

            if (slide.annotation) {
                const annotationBox = document.createElement("div");
                annotationBox.className = "slide_annotation";
                annotationBox.innerHTML = slide.annotation;
                main.appendChild(annotationBox);
            }

            if (slide.annotation2 && Array.isArray(slide.annotation2)) {
                const annotationBox = document.createElement("div");
                annotationBox.className = "slide_annotation2";
                slide.annotation2.forEach(colText => {
                    const col = document.createElement("div");
                    col.className = "annotation2_col";
                    col.innerHTML = colText;
                    annotationBox.appendChild(col);
                });
                main.appendChild(annotationBox);
            }

            if (slide.sound && typeof slide.sound === "string") {
                const soundBtn = document.createElement("button");
                soundBtn.className = "sound";
                const img = document.createElement("img");
                img.src = "images/icons/megaphone.svg";
                soundBtn.appendChild(img);

                const audio = document.createElement("audio");
                audio.src = slide.sound;
                soundBtn.addEventListener("click", () => {
                    if (audio.paused) {
                        audio.play();
                    } else {
                        audio.pause();
                    }
                });

                main.appendChild(soundBtn);
                main.appendChild(audio);
            }

            slideEl.appendChild(main);

            const footer = document.createElement("div");
            footer.className = "slide_footer";

            if (slide.type === "quiz") {
                if (slide.questions && slide.questions.length > 1) {
                    // ✅ 다수 문제 처리 (OX 문제)
                    const footerContent = document.createElement("div");
                    footerContent.className = "quiz-footer-content";

                    slide.questions.forEach((q, idx) => {
                        const box = document.createElement("div");
                        box.className = "quiz-footer-box";
                        const label = document.createElement("span");
                        label.textContent = `${idx + 1}.`;

                        const oBtn = document.createElement("button");
                        oBtn.className = "ox-btn";
                        oBtn.textContent = "O";
                        oBtn.dataset.value = "O";

                        const xBtn = document.createElement("button");
                        xBtn.className = "ox-btn";
                        xBtn.textContent = "X";
                        xBtn.dataset.value = "X";

                        oBtn.addEventListener('click', () => selectOXButton(oBtn));
                        xBtn.addEventListener('click', () => selectOXButton(xBtn));

                        box.appendChild(label);
                        box.appendChild(oBtn);
                        box.appendChild(xBtn);
                        footerContent.appendChild(box);
                    });

                    const button = document.createElement("button");
                    button.className = "quiz-submit";
                    button.textContent = "제출";
                    button.addEventListener('click', () => handleOXQuizSubmit(slide.questions));

                    footer.appendChild(footerContent);
                    footer.appendChild(button);
                } else {
                    // ✅ 기본 문제 하나 처리 (입력형)
                    const input = document.createElement("input");
                    input.className = "quiz-input";
                    input.setAttribute("data-answer", slide.answer);
                    input.placeholder = "답을 입력하세요!";

                    const button = document.createElement("button");
                    button.className = "quiz-submit";
                    button.textContent = "제출";

                    footer.appendChild(input);
                    footer.appendChild(button);
                }
            } else {
                footer.textContent = "아래로 넘기세요";
            }

            slideEl.appendChild(footer);
            slidesContainer.appendChild(slideEl);
        });
    } catch (err) {
        console.error("데이터 로딩 실패:", err);
    }
}

function selectOXButton(btn) {
    const siblings = btn.parentNode.querySelectorAll('.ox-btn');
    siblings.forEach(s => s.classList.remove('selected'));
    btn.classList.add('selected');
}

function handleOXQuizSubmit(questions) {
    const quizBoxes = document.querySelectorAll('.quiz-footer-box');
    let allCorrect = true;

    quizBoxes.forEach((box, idx) => {
        const selected = box.querySelector('.ox-btn.selected');
        const correctAnswer = questions[idx].answer;

        if (!selected) {
            allCorrect = false;
        } else if (selected.dataset.value !== correctAnswer) {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        alert('정답입니다!');

        const slide = document.querySelector('.slide_quiz.active') || document.querySelector('.slide_quiz');
        if (slide) {
            const mainText = slide.querySelector('.slide_main_text') || slide.querySelector('.slide_video_main_text');
            const image = slide.querySelector('.slide_main_image');
            const footer = slide.querySelector('.slide_footer');

            if (image) image.remove();

            const explanation = document.createElement('div');
            explanation.className = 'quiz-explanation';
            
            // 여러 문제를 하나의 문자열로 연결
            const correctAnswersText = questions.map((q, i) => `${i + 1}. ${q.answer}`).join('  ');
            explanation.innerText = `✅ 정답은 "${correctAnswersText}" 입니다. 잘 하셨어요!`;

            if (mainText) mainText.appendChild(explanation);

            if (footer) footer.style.display = 'none';
        }
    } else {
        alert('틀린 답이 있습니다. 다시 확인해보세요.');
    }
}


// ✅ intro.html에서 사용할 데이터 로딩
async function loadIntroFromJson(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        // console.log(response);
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

        // 소개 영상
        const videoEl = document.querySelector('#main_video');
        if (videoEl && data.introVideo) {
            videoEl.src = data.introVideo;
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
        // console.error("인트로 데이터 로딩 실패:", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
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
            // console.log("🔍 슬라이드 감지 완료, 이벤트 바인딩");
            window.initializeSlideEvents();
            observer.disconnect(); // 중복 바인딩 방지
        }
    });

    observer.observe(slidesContainer, { childList: true });
}