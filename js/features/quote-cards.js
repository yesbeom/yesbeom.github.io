import { RESEARCHER_QUOTES } from "../data/researcher-quotes.js";
import { pickRandomItems } from "../utils/random.js";

const CARD_COUNT = 3;

const createCard = (quote, index) => {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "quote-card";
  card.style.setProperty("--deal-delay", `${index * 140}ms`);
  card.setAttribute("aria-label", `카드 ${index + 1} 뒤집기`);

  const inner = document.createElement("span");
  inner.className = "quote-card-inner";

  const back = document.createElement("span");
  back.className = "quote-card-face quote-card-back";
  back.setAttribute("aria-hidden", "true");
  back.innerHTML = `
    <span class="quote-card-logo">SY</span>
    <span>Quote Card</span>
  `;

  const front = document.createElement("span");
  front.className = "quote-card-face quote-card-front";

  const mark = document.createElement("span");
  mark.className = "quote-card-mark";
  mark.textContent = "“";

  const text = document.createElement("span");
  text.className = "quote-card-text";
  text.textContent = quote.text;

  const translation = document.createElement("span");
  translation.className = "quote-card-translation";
  translation.textContent = quote.translation;

  const author = document.createElement("span");
  author.className = "quote-card-author";
  author.textContent = quote.author;

  const detail = document.createElement("em");
  detail.textContent = quote.detail;
  author.appendChild(detail);

  front.append(mark, text, translation, author);
  inner.append(back, front);
  card.appendChild(inner);

  card.title = quote.source;

  return card;
};

export const initQuoteCards = () => {
  const deck = document.getElementById("quote-deck");
  const redrawButton = document.getElementById("quote-redraw-button");

  if (!deck || !redrawButton) {
    return;
  }

  // 한 벌에서 한 장만 뒤집을 수 있다. 한 장을 열면 나머지는 잠기고, "다시 뽑기"로만 초기화된다.
  const dealCards = () => {
    const quotes = pickRandomItems(RESEARCHER_QUOTES, CARD_COUNT);
    const cards = quotes.map(createCard);

    cards.forEach((card, index) => {
      card.addEventListener(
        "click",
        () => {
          card.classList.add("is-flipped");
          card.setAttribute("aria-label", `${quotes[index].author}의 명언 카드`);

          cards.forEach((other) => {
            if (other !== card) {
              other.disabled = true;
            }
          });
        },
        { once: true },
      );
    });

    deck.replaceChildren(...cards);
  };

  redrawButton.addEventListener("click", dealCards);
  dealCards();
};
