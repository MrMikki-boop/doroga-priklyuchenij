/**
 * Финальный эпилог ваншота «Путь из Берегоста».
 * Foundry VTT 13, тип макроса: Script.
 */
(async () => {
  "use strict";

  try {
    if (!game.user.isGM) {
      return ui.notifications.warn("Этот макрос предназначен для мастера.");
    }

    const DialogV2 = foundry?.applications?.api?.DialogV2;
    if (!DialogV2) {
      return ui.notifications.error("Для этого макроса требуется Foundry VTT 13.");
    }

    // Передача HTMLElement не даёт DialogV2 удалить локальные стили при очистке HTML.
    const asDialogContent = (html) => {
      const container = document.createElement("div");
      container.innerHTML = html;
      return container;
    };

    const surveyStyles = `
      <style>
        .application.ts-ending-dialog .window-content {
          overflow: hidden;
        }
        .application.ts-ending-dialog form.dialog-form {
          height: 100%;
          min-height: 0;
        }
        .application.ts-ending-dialog .dialog-content {
          flex: 1 1 auto;
          min-height: 0;
          overflow-x: hidden;
          overflow-y: auto;
          padding-right: 6px;
          scrollbar-gutter: stable;
        }
        .application.ts-ending-dialog .form-footer {
          flex: 0 0 auto;
        }
        .ts-ending-survey {
          --ts-gold: #d8b66a;
          --ts-gold-soft: #f0d99b;
          --ts-ink: #ede7d8;
          --ts-muted: #bdb5a4;
          --ts-panel: rgba(24, 27, 29, .92);
          color: var(--ts-ink);
          padding: 2px;
        }
        .ts-ending-survey * { box-sizing: border-box; }
        .ts-ending-survey .ts-hero {
          position: relative;
          overflow: hidden;
          margin-bottom: 14px;
          padding: 20px 22px;
          border: 1px solid rgba(216, 182, 106, .55);
          border-radius: 12px;
          background:
            radial-gradient(circle at 85% 15%, rgba(216, 182, 106, .18), transparent 32%),
            linear-gradient(135deg, #252a2d 0%, #171a1c 100%);
          box-shadow: 0 8px 24px rgba(0, 0, 0, .28);
        }
        .ts-ending-survey .ts-hero::after {
          content: "";
          position: absolute;
          inset: 7px;
          pointer-events: none;
          border: 1px solid rgba(216, 182, 106, .14);
          border-radius: 8px;
        }
        .ts-ending-survey .ts-kicker {
          margin-bottom: 5px;
          color: var(--ts-gold);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .ts-ending-survey h2 {
          margin: 0 0 6px;
          border: 0;
          color: #fff8e8;
          font-family: Georgia, serif;
          font-size: 24px;
          line-height: 1.15;
        }
        .ts-ending-survey .ts-hero p {
          margin: 0;
          color: var(--ts-muted);
          line-height: 1.45;
        }
        .ts-ending-survey .ts-section {
          margin: 12px 0;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, .09);
          border-radius: 10px;
          background: var(--ts-panel);
        }
        .ts-ending-survey .ts-section-title {
          display: flex;
          gap: 9px;
          align-items: center;
          margin-bottom: 10px;
          color: var(--ts-gold-soft);
          font-size: 14px;
          font-weight: 800;
        }
        .ts-ending-survey .ts-section-title i {
          width: 18px;
          color: var(--ts-gold);
          text-align: center;
        }
        .ts-ending-survey .ts-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .ts-ending-survey .ts-radio {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }
        .ts-ending-survey .ts-option {
          display: block;
          min-height: 72px;
          margin: 0;
          padding: 11px 12px;
          border: 1px solid rgba(255, 255, 255, .11);
          border-radius: 8px;
          background: rgba(255, 255, 255, .035);
          cursor: pointer;
          transition: border-color .15s ease, background .15s ease, transform .15s ease;
        }
        .ts-ending-survey .ts-option:hover {
          border-color: rgba(216, 182, 106, .48);
          background: rgba(216, 182, 106, .07);
          transform: translateY(-1px);
        }
        .ts-ending-survey .ts-option strong {
          display: block;
          margin-bottom: 3px;
          color: #f4efe4;
          font-size: 13px;
        }
        .ts-ending-survey .ts-option small {
          display: block;
          color: var(--ts-muted);
          font-size: 11px;
          line-height: 1.35;
        }
        .ts-ending-survey .ts-radio:checked + .ts-option {
          border-color: var(--ts-gold);
          background: linear-gradient(135deg, rgba(216, 182, 106, .17), rgba(216, 182, 106, .06));
          box-shadow: inset 0 0 0 1px rgba(216, 182, 106, .18), 0 0 14px rgba(216, 182, 106, .08);
        }
        .ts-ending-survey .ts-radio:focus-visible + .ts-option {
          outline: 2px solid #fff2bd;
          outline-offset: 2px;
        }
        .ts-ending-survey .ts-note {
          margin: 9px 1px 0;
          color: #9f988b;
          font-size: 11px;
          line-height: 1.4;
        }
        @media (max-width: 620px) {
          .ts-ending-survey .ts-grid { grid-template-columns: 1fr; }
        }
      </style>`;

    const surveyContent = `${surveyStyles}
      <div class="ts-ending-survey">
        <header class="ts-hero">
          <div class="ts-kicker">Врата Балдура · Эпилог</div>
          <h2><i class="fa-solid fa-scroll"></i> Чем закончился путь?</h2>
          <p>Отметьте решения группы. Макрос свяжет последствия и подготовит цельный финал приключения.</p>
        </header>

        <section class="ts-section">
          <div class="ts-section-title"><i class="fa-solid fa-road"></i> Засада на Тракте Мечей</div>
          <div class="ts-grid">
            <input class="ts-radio" type="radio" name="ambush" id="ts-ambush-stopped" value="stopped" checked>
            <label class="ts-option" for="ts-ambush-stopped">
              <strong>Никто не ушёл</strong>
              <small>Всех разбойников уничтожили или пленили.</small>
            </label>
            <input class="ts-radio" type="radio" name="ambush" id="ts-ambush-escaped" value="escaped">
            <label class="ts-option" for="ts-ambush-escaped">
              <strong>Кто-то сбежал</strong>
              <small>Уцелевший предупредил остальных Жентарим.</small>
            </label>
          </div>
        </section>

        <section class="ts-section">
          <div class="ts-section-title"><i class="fa-solid fa-tree"></i> Хранитель леса</div>
          <div class="ts-grid">
            <input class="ts-radio" type="radio" name="spirit" id="ts-spirit-friend" value="friend" checked>
            <label class="ts-option" for="ts-spirit-friend">
              <strong>Заслужили доверие</strong>
              <small>Герои проявили уважение и договорились с духом.</small>
            </label>
            <input class="ts-radio" type="radio" name="spirit" id="ts-spirit-neutral" value="neutral">
            <label class="ts-option" for="ts-spirit-neutral">
              <strong>Разошлись мирно</strong>
              <small>Без дружбы и вражды — каждый пошёл своей дорогой.</small>
            </label>
            <input class="ts-radio" type="radio" name="spirit" id="ts-spirit-angry" value="angry">
            <label class="ts-option" for="ts-spirit-angry">
              <strong>Разгневали хранителя</strong>
              <small>Герои напали и не сумели восстановить мир.</small>
            </label>
          </div>
        </section>

        <section class="ts-section">
          <div class="ts-section-title"><i class="fa-solid fa-user-secret"></i> Главарь Жентарим</div>
          <div class="ts-grid">
            <input class="ts-radio" type="radio" name="trader" id="ts-trader-released" value="released" checked>
            <label class="ts-option" for="ts-trader-released">
              <strong>Ему позволили уехать</strong>
              <small>Герои поверили торговцу или приняли его предложение.</small>
            </label>
            <input class="ts-radio" type="radio" name="trader" id="ts-trader-captured" value="captured">
            <label class="ts-option" for="ts-trader-captured">
              <strong>Захвачен живым</strong>
              <small>Главарь и его показания переданы властям.</small>
            </label>
            <input class="ts-radio" type="radio" name="trader" id="ts-trader-killed" value="killed">
            <label class="ts-option" for="ts-trader-killed">
              <strong>Убит</strong>
              <small>Диверсия сорвана, но допросить главаря невозможно.</small>
            </label>
            <input class="ts-radio" type="radio" name="trader" id="ts-trader-escaped" value="escaped">
            <label class="ts-option" for="ts-trader-escaped">
              <strong>Уничтожил груз и сбежал</strong>
              <small>Повозка взорвалась, а главарь скрылся в хаосе.</small>
            </label>
          </div>
        </section>

        <section class="ts-section">
          <div class="ts-section-title"><i class="fa-solid fa-fire-flame-curved"></i> Повозка с маслом</div>
          <div class="ts-grid">
            <input class="ts-radio" type="radio" name="fire" id="ts-fire-no" value="no" checked>
            <label class="ts-option" for="ts-fire-no">
              <strong>Лес не загорелся</strong>
              <small>Повозка осталась цела либо огонь не распространился.</small>
            </label>
            <input class="ts-radio" type="radio" name="fire" id="ts-fire-yes" value="yes">
            <label class="ts-option" for="ts-fire-yes">
              <strong>Начался лесной пожар</strong>
              <small>Взрыв повозки вызвал гнев древнего хранителя.</small>
            </label>
          </div>
          <p class="ts-note"><i class="fa-solid fa-circle-info"></i> При побеге главаря пожар учитывается автоматически. Если торговца отпустили, повозка доезжает до города и лес не загорается.</p>
        </section>
      </div>`;

    const answers = await DialogV2.wait({
      classes: ["dialog", "ts-ending-dialog"],
      window: {
        title: "Финальный эпилог",
        icon: "fa-solid fa-scroll"
      },
      position: {
        width: Math.min(760, Math.max(360, globalThis.innerWidth - 48)),
        height: Math.min(800, Math.max(440, globalThis.innerHeight - 96))
      },
      content: asDialogContent(surveyContent),
      buttons: [
        {
          action: "build",
          label: "Составить эпилог",
          icon: "fa-solid fa-wand-magic-sparkles",
          default: true,
          callback: (_event, button, dialog) => {
            const form = button.form ?? button.closest?.("form") ?? dialog.element?.querySelector?.("form");
            if (!form) throw new Error("Не удалось прочитать форму эпилога.");
            return Object.fromEntries(new FormData(form).entries());
          }
        },
        {
          action: "cancel",
          label: "Отмена",
          icon: "fa-solid fa-xmark",
          callback: () => null
        }
      ],
      close: () => null
    });

    if (!answers) return;

    const state = {
      ambush: answers.ambush ?? "stopped",
      spirit: answers.spirit ?? "friend",
      trader: answers.trader ?? "released",
      fire: answers.fire === "yes"
    };

    // Эти два исхода однозначно определяют судьбу повозки.
    if (state.trader === "escaped") state.fire = true;
    if (state.trader === "released") state.fire = false;

    const happened = [
      "Герои и Элдон добрались до Врат Балдура. Их путешествие завершилось, но решения, принятые на Тракте Мечей, уже изменили судьбу дороги, леса и самого города."
    ];
    const future = [];
    const gmNotes = [
      "Жентарим сами устроили первый пожар на складах масла. Затем дорожные банды перехватывали новые поставки, чтобы город не смог восполнить запасы. Похищенное масло прятали и продавали малыми партиями через подставных торговцев по завышенной цене. Повозка главаря должна была уничтожить последний крупный независимый склад, ещё сильнее подняв цены и устранив конкурентов."
    ];

    if (state.ambush === "escaped") {
      happened.push("Хотя бы один разбойник пережил засаду и успел предупредить другую ячейку Жентарим. Вскоре караван Маркуса Хольда, следовавший из Берегоста, попал в подготовленную засаду: часть охраны погибла, а значительная часть груза была похищена.");
      future.push("Перехваченные караваны ещё некоторое время не позволят городу восполнить запасы масла. Пока эта ячейка действует, дефицит и высокие цены сохранятся.");
      gmNotes.push("Уцелевший разбойник связал дорожную засаду с финалом: именно его предупреждение позволило Жентарим выбрать караван Маркуса следующей целью.");
    } else {
      happened.push("Дорожная ячейка Жентарим была полностью уничтожена или пленена. Никто не смог предупредить сообщников о героях и следующих караванах.");
      future.push("Тракт на некоторое время станет заметно спокойнее. Новые поставки снова смогут доходить до Врат Балдура, ослабляя созданный Жентарим дефицит.");
    }

    if (state.trader === "released") {
      happened.push("Главарь Жентарим добрался до города под видом обычного торговца. Через несколько дней его повозка оказалась возле крупного склада масла, и подготовленный взрыв уничтожил здание. В огне погибли люди, а пожар перекинулся на соседние строения.");
      future.push("Цена масла взлетит ещё выше, а Жентарим начнут продавать спрятанные запасы через подставных торговцев. Свидетели видели главаря рядом с героями, поэтому городская стража заинтересуется их ролью в случившемся.");
      gmNotes.push("Герои не раскрыли схему. Главарь завершил второй этап плана и временно обеспечил Жентарим контроль над дефицитным товаром.");
    } else if (state.trader === "captured") {
      happened.push("Главаря доставили во Врата Балдура живым. На допросе он раскрыл схему: первый пожар был диверсией Жентарим, дорожные банды перекрывали новые поставки, а украденное масло продавалось через подставных торговцев. Его собственная повозка предназначалась для нового взрыва.");
      future.push("Власти предотвратят диверсию, найдут часть тайных складов и начнут аресты среди подставных торговцев. Поставки постепенно восстановятся, цены пойдут вниз, а герои и Элдон получат щедрую награду.");
      gmNotes.push("Это наиболее полное раскрытие заговора. Даже если один разбойник сбежал и успел организовать нападение на караван Маркуса, показания главаря позволят пресечь последующие атаки.");
    } else if (state.trader === "killed") {
      happened.push("Главарь Жентарим погиб, и его груз не достиг намеченного склада. Подготовленная диверсия сорвалась, но вместе с ним была потеряна большая часть сведений о заговоре.");
      future.push("Город избежит нового взрыва, однако оставшиеся ячейки Жентарим продолжат действовать из тени. Герои знают, что за дефицитом стоит более крупная сеть, но её имена и тайные склады пока остаются неизвестными.");
      gmNotes.push("Смерть главаря закрывает непосредственную угрозу, но оставляет Жентарим зацепкой для продолжения кампании.");
    } else {
      happened.push("Поняв, что проигрывает, главарь уничтожил груз и улики. Во время взрыва ему удалось вскочить на подготовленного коня и скрыться по тракту. Склад во Вратах Балдура уцелел, но сам заговорщик остался на свободе.");
      future.push("Главарь соберёт новых людей и продолжит тёмные дела через посредников. Теперь его личной целью станут герои: он будет вредить их союзникам, подрывать их репутацию и устраивать новые ловушки, стараясь насолить тем, кто сорвал его план.");
      gmNotes.push("Побег главаря создаёт личного повторяющегося противника. Текущая диверсия сорвана, но сам организатор может вернуться позже.");
    }

    if (state.fire) {
      if (state.spirit === "friend") {
        happened.push("Ранее хранитель принял героев как друзей леса, однако взрыв повозки и разгоревшийся пожар уничтожили это доверие. Дух возложил ответственность за случившееся на всю группу.");
      } else if (state.spirit === "neutral") {
        happened.push("Герои и хранитель расстались мирно, не став ни друзьями, ни врагами. Но вспыхнувший после взрыва лесной пожар заставил духа изменить своё решение и признать путников виновными.");
      } else {
        happened.push("Герои уже разгневали хранителя, а пожар после взрыва повозки лишь подтвердил его худшие опасения. Гнев всего леса последовал за ними до городских стен.");
      }
      future.push("На героях лежит проклятие хранителя: любая растительная пища кажется им на вкус мокрой землёй, а все дикие животные изначально относятся к ним враждебно. Проклятие сохранится, пока группа не искупит свою вину перед лесом.");
      gmNotes.push("Лесной пожар имеет приоритет над прежним исходом встречи с духом: даже заслуженное ранее доверие сменяется проклятием.");
    } else if (state.spirit === "friend") {
      happened.push("Герои проявили уважение к древнему хранителю и заслужили доверие леса.");
      future.push("Лес вновь станет спокойнее. Звери будут обходить лагеря мирных путников, а хранитель запомнит героев как желанных гостей и возможных союзников.");
    } else if (state.spirit === "neutral") {
      happened.push("Герои выполнили требование хранителя или прекратили конфликт до того, как была пролита лишняя кровь. Обе стороны мирно и без спешки разошлись своими дорогами.");
      future.push("Лес останется нейтрален к героям: хранитель не станет ни помогать им, ни преследовать их. При новой встрече доверие придётся заслуживать заново.");
    } else {
      happened.push("Герои напали на хранителя и покинули лес, не восстановив мир. Древний дух пережил столкновение и запомнил нанесённую ему обиду.");
      future.push("Среди путников начнут ходить рассказы о пропавших в лесу людях. Звери и древние хранители будут встречать героев как врагов, пока те не найдут способ искупить содеянное.");
    }

    const outcomeLabels = {
      ambush: state.ambush === "escaped" ? "Разбойник сбежал" : "Банда остановлена",
      spirit: state.fire
        ? "Проклятие леса"
        : ({ friend: "Доверие хранителя", neutral: "Мирный нейтралитет", angry: "Гнев хранителя" }[state.spirit]),
      trader: ({ released: "Диверсия состоялась", captured: "Главарь пленён", killed: "Главарь убит", escaped: "Главарь сбежал" }[state.trader])
    };

    const resultStyles = `
      <style>
        .application.ts-result-dialog .window-content {
          overflow: hidden;
        }
        .application.ts-result-dialog form.dialog-form {
          height: 100%;
          min-height: 0;
        }
        .application.ts-result-dialog .dialog-content {
          flex: 1 1 auto;
          min-height: 0;
          overflow-x: hidden;
          overflow-y: auto;
          padding-right: 6px;
          scrollbar-gutter: stable;
        }
        .application.ts-result-dialog .form-footer {
          flex: 0 0 auto;
        }
        .ts-epilogue {
          --gold: #d8b66a;
          --cream: #f3ead7;
          --muted: #c3baa9;
          overflow: hidden;
          color: var(--cream);
          border: 1px solid rgba(216, 182, 106, .58);
          border-radius: 12px;
          background: linear-gradient(155deg, #23282b 0%, #121517 100%);
          box-shadow: 0 10px 30px rgba(0, 0, 0, .32);
        }
        .ts-epilogue * { box-sizing: border-box; }
        .ts-epilogue .ts-result-head {
          position: relative;
          padding: 21px 22px 18px;
          border-bottom: 1px solid rgba(216, 182, 106, .28);
          background:
            radial-gradient(circle at 88% 8%, rgba(216, 182, 106, .22), transparent 33%),
            linear-gradient(115deg, rgba(87, 58, 35, .38), transparent 55%);
        }
        .ts-epilogue .ts-result-kicker {
          margin-bottom: 4px;
          color: var(--gold);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }
        .ts-epilogue h2 {
          margin: 0;
          border: 0;
          color: #fff8e8;
          font-family: Georgia, serif;
          font-size: 25px;
          line-height: 1.2;
        }
        .ts-epilogue .ts-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 12px;
        }
        .ts-epilogue .ts-tag {
          padding: 4px 8px;
          border: 1px solid rgba(216, 182, 106, .35);
          border-radius: 999px;
          color: #ead7a8;
          background: rgba(216, 182, 106, .08);
          font-size: 10px;
          font-weight: 700;
        }
        .ts-epilogue .ts-result-body { padding: 16px; }
        .ts-epilogue .ts-result-block {
          margin-bottom: 12px;
          padding: 14px 15px;
          border: 1px solid rgba(255, 255, 255, .08);
          border-radius: 9px;
          background: rgba(255, 255, 255, .035);
        }
        .ts-epilogue .ts-result-block:last-child { margin-bottom: 0; }
        .ts-epilogue .ts-result-title {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 9px;
          color: #efd79a;
          font-size: 14px;
          font-weight: 900;
        }
        .ts-epilogue .ts-result-title i { width: 17px; text-align: center; }
        .ts-epilogue ul {
          margin: 0;
          padding-left: 20px;
        }
        .ts-epilogue li {
          margin: 0 0 8px;
          color: var(--cream);
          line-height: 1.48;
        }
        .ts-epilogue li:last-child { margin-bottom: 0; }
        .ts-epilogue li::marker { color: var(--gold); }
        .ts-epilogue .ts-gm-block {
          border-color: rgba(126, 164, 188, .25);
          background: linear-gradient(135deg, rgba(41, 69, 84, .3), rgba(29, 43, 50, .24));
        }
        .ts-epilogue .ts-gm-block .ts-result-title { color: #afd5e8; }
        .ts-epilogue .ts-gm-block li::marker { color: #81bad7; }
        .ts-epilogue .ts-finale {
          padding: 13px 16px 16px;
          color: #d6cdbd;
          font-family: Georgia, serif;
          font-size: 13px;
          font-style: italic;
          line-height: 1.45;
          text-align: center;
        }
      </style>`;

    const list = (items) => `<ul style="margin:0;padding-left:20px">${items.map((item) => `<li style="margin:0 0 8px;color:#f3ead7;line-height:1.48">${item}</li>`).join("")}</ul>`;
    const tags = Object.values(outcomeLabels).map((label) => `<span class="ts-tag" style="padding:4px 8px;border:1px solid rgba(216,182,106,.35);border-radius:999px;color:#ead7a8;background:rgba(216,182,106,.08);font-size:10px;font-weight:700">${label}</span>`).join("");

    // Основные стили продублированы inline: так карточка сохраняет оформление и в чате Foundry.
    const buildResult = ({ includeGM = false } = {}) => `${resultStyles}
      <article class="ts-epilogue" style="overflow:hidden;color:#f3ead7;border:1px solid rgba(216,182,106,.58);border-radius:12px;background:linear-gradient(155deg,#23282b 0%,#121517 100%);box-shadow:0 10px 30px rgba(0,0,0,.32)">
        <header class="ts-result-head" style="position:relative;padding:21px 22px 18px;border-bottom:1px solid rgba(216,182,106,.28);background:radial-gradient(circle at 88% 8%,rgba(216,182,106,.22),transparent 33%),linear-gradient(115deg,rgba(87,58,35,.38),transparent 55%)">
          <div class="ts-result-kicker" style="margin-bottom:4px;color:#d8b66a;font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase">Путь завершён · Последствия остаются</div>
          <h2 style="margin:0;border:0;color:#fff8e8;font-family:Georgia,serif;font-size:25px;line-height:1.2"><i class="fa-solid fa-city"></i> Эпилог: Врата Балдура</h2>
          <div class="ts-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">${tags}</div>
        </header>
        <div class="ts-result-body" style="padding:16px">
          <section class="ts-result-block" style="margin-bottom:12px;padding:14px 15px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(255,255,255,.035)">
            <div class="ts-result-title" style="display:flex;gap:8px;align-items:center;margin-bottom:9px;color:#efd79a;font-size:14px;font-weight:900"><i class="fa-solid fa-book-open"></i> Что стало</div>
            ${list(happened)}
          </section>
          <section class="ts-result-block" style="margin-bottom:12px;padding:14px 15px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(255,255,255,.035)">
            <div class="ts-result-title" style="display:flex;gap:8px;align-items:center;margin-bottom:9px;color:#efd79a;font-size:14px;font-weight:900"><i class="fa-solid fa-compass"></i> Что будет</div>
            ${list(future)}
          </section>
          ${includeGM ? `
            <section class="ts-result-block ts-gm-block" style="margin-bottom:0;padding:14px 15px;border:1px solid rgba(126,164,188,.25);border-radius:9px;background:linear-gradient(135deg,rgba(41,69,84,.3),rgba(29,43,50,.24))">
              <div class="ts-result-title" style="display:flex;gap:8px;align-items:center;margin-bottom:9px;color:#afd5e8;font-size:14px;font-weight:900"><i class="fa-solid fa-user-shield"></i> За кулисами — только мастеру</div>
              ${list(gmNotes)}
            </section>` : ""}
        </div>
        <footer class="ts-finale" style="padding:13px 16px 16px;color:#d6cdbd;font-family:Georgia,serif;font-size:13px;font-style:italic;line-height:1.45;text-align:center">Дорога закончилась у городских ворот. Последствия решений героев только начинают раскрываться.</footer>
      </article>`;

    const publicHTML = buildResult({ includeGM: false });
    const gmHTML = buildResult({ includeGM: true });
    const plainText = [
      "ЭПИЛОГ: ВРАТА БАЛДУРА",
      "",
      "ЧТО СТАЛО",
      ...happened.map((item) => `• ${item}`),
      "",
      "ЧТО БУДЕТ",
      ...future.map((item) => `• ${item}`),
      "",
      "ЗА КУЛИСАМИ — ТОЛЬКО МАСТЕРУ",
      ...gmNotes.map((item) => `• ${item}`)
    ].join("\n");

    await DialogV2.wait({
      classes: ["dialog", "ts-result-dialog"],
      window: {
        title: "Последствия приключения",
        icon: "fa-solid fa-city"
      },
      position: {
        width: Math.min(760, Math.max(360, globalThis.innerWidth - 48)),
        height: Math.min(780, Math.max(440, globalThis.innerHeight - 96))
      },
      content: asDialogContent(gmHTML),
      buttons: [
        {
          action: "players",
          label: "Отправить эпилог в чат",
          icon: "fa-solid fa-share-from-square",
          style: { flexBasis: "100%" },
          default: true,
          callback: async () => {
            await ChatMessage.create({
              user: game.user.id,
              speaker: { alias: "Эпилог" },
              content: publicHTML
            });
            ui.notifications.info("Эпилог опубликован для игроков.");
          }
        },
        {
          action: "gm",
          label: "Только мастерам",
          icon: "fa-solid fa-user-shield",
          callback: async () => {
            const recipients = ChatMessage.getWhisperRecipients("GM").map((user) => user.id);
            await ChatMessage.create({
              user: game.user.id,
              speaker: { alias: "Эпилог — мастерская сводка" },
              whisper: recipients,
              content: gmHTML
            });
            ui.notifications.info("Полная сводка отправлена мастерам.");
          }
        },
        {
          action: "copy",
          label: "Копировать",
          icon: "fa-solid fa-copy",
          callback: async () => {
            await game.clipboard.copyPlainText(plainText);
            ui.notifications.info("Текст эпилога скопирован.");
          }
        },
        {
          action: "close",
          label: "Закрыть",
          icon: "fa-solid fa-xmark"
        }
      ],
      close: () => null
    });
  } catch (error) {
    console.error("[Финальный эпилог] Ошибка макроса", error);
    ui.notifications.error(`Не удалось создать эпилог: ${error.message}`);
  }
})();
