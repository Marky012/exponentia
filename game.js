/*
  Exponentia: Laws of Exponents Quest
  - Intro story and dragon pet guide
  - Walkthrough of 8 exponent laws
  - Mastery pre-test awarding 8 gems (1 per law)
  - Levels (Easy, Medium, Hard) with monsters (3 main enemies)
  - One-time per-level dragon help to view laws
  - Wrong answers logged by dragon for end report
  - Final score report and story resolution
*/

(function() {
  const appRoot = document.getElementById('app');
  const helpModal = document.getElementById('help-modal');
  const lawsListEl = document.getElementById('laws-list');
  const closeHelpBtn = document.getElementById('close-help');
  const toastEl = document.getElementById('toast');

  const SCREENS = {
    INTRO: 'intro',
    WALKTHROUGH: 'walkthrough',
    MASTERY: 'mastery',
    LEVEL_SELECT: 'level-select',
    QUIZ: 'quiz',
    FINAL: 'final'
  };

  const DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
  };

  const enemies = {
    [DIFFICULTY.EASY]: {
      key: DIFFICULTY.EASY,
      name: 'Mist Wraith',
      description: 'A foggy trickster that muddles simple powers',
      hp: 5
    },
    [DIFFICULTY.MEDIUM]: {
      key: DIFFICULTY.MEDIUM,
      name: 'Logra the Confuser',
      description: 'Spins products and quotients into chaos',
      hp: 6
    },
    [DIFFICULTY.HARD]: {
      key: DIFFICULTY.HARD,
      name: 'The Null King',
      description: 'Rules over zero and negative shadows',
      hp: 7
    }
  };

  const exponentLaws = [
    {
      key: 'product',
      title: 'Product of Powers',
      rule: 'a^m · a^n = a^(m + n)',
      note: 'Same base, add exponents.'
    },
    {
      key: 'quotient',
      title: 'Quotient of Powers',
      rule: 'a^m / a^n = a^(m − n), a ≠ 0',
      note: 'Same base, subtract exponents.'
    },
    {
      key: 'power_of_power',
      title: 'Power of a Power',
      rule: '(a^m)^n = a^(m · n)',
      note: 'Multiply exponents.'
    },
    {
      key: 'power_of_product',
      title: 'Power of a Product',
      rule: '(ab)^n = a^n · b^n',
      note: 'Distribute exponent across multiplication.'
    },
    {
      key: 'power_of_quotient',
      title: 'Power of a Quotient',
      rule: '(a/b)^n = a^n / b^n, b ≠ 0',
      note: 'Distribute exponent across division.'
    },
    {
      key: 'zero_exponent',
      title: 'Zero Exponent',
      rule: 'a^0 = 1, a ≠ 0',
      note: 'Anything non-zero to the zero power is 1.'
    },
    {
      key: 'negative_exponent',
      title: 'Negative Exponent',
      rule: 'a^(−n) = 1 / a^n',
      note: 'Move to denominator to make exponent positive.'
    },
    {
      key: 'fractional_exponent',
      title: 'Fractional Exponent',
      rule: 'a^(m/n) = n√(a^m) = (n√a)^m',
      note: 'Denominator is root; numerator is power.'
    }
  ];

  const masteryQuestions = [
    // One per law
    { law: 'product', prompt: 'Simplify: x^3 · x^4', choices: ['x^7', 'x^12', 'x^1'], answer: 'x^7', explanation: 'Add exponents 3 + 4 = 7.' },
    { law: 'quotient', prompt: 'Simplify: y^9 / y^2', choices: ['y^18', 'y^7', 'y^11'], answer: 'y^7', explanation: 'Subtract exponents 9 − 2 = 7.' },
    { law: 'power_of_power', prompt: 'Simplify: (a^2)^5', choices: ['a^7', 'a^10', 'a^25'], answer: 'a^10', explanation: 'Multiply exponents 2 · 5 = 10.' },
    { law: 'power_of_product', prompt: 'Simplify: (3b)^3', choices: ['3b^3', '27b^3', '9b^3'], answer: '27b^3', explanation: '3^3 = 27 and b^3.' },
    { law: 'power_of_quotient', prompt: 'Simplify: (m/n)^2', choices: ['m^2/n^2', 'm^2/n', 'm/n^2'], answer: 'm^2/n^2', explanation: 'Distribute exponent across numerator and denominator.' },
    { law: 'zero_exponent', prompt: 'Evaluate: (5k)^0', choices: ['0', '1', '5k'], answer: '1', explanation: 'Any non-zero base to 0 is 1.' },
    { law: 'negative_exponent', prompt: 'Rewrite with positive exponent: p^(−3)', choices: ['p^3', '1/p^3', '−p^3'], answer: '1/p^3', explanation: 'Negative exponent in numerator moves to denominator.' },
    { law: 'fractional_exponent', prompt: 'Rewrite: q^(3/2)', choices: ['√q^3', '√(q^3)', '(√q)^3'], answer: '(√q)^3', explanation: '1/2 is square root then raise to 3.' }
  ];

  const levelQuestionBank = {
    [DIFFICULTY.EASY]: [
      { prompt: 'Simplify: a^2 · a^5', choices: ['a^10', 'a^7', 'a^3'], answer: 'a^7', law: 'product' },
      { prompt: 'Simplify: b^6 / b^4', choices: ['b^2', 'b^10', 'b^24'], answer: 'b^2', law: 'quotient' },
      { prompt: 'Simplify: (c)^1', choices: ['1', 'c', 'c^0'], answer: 'c', law: 'power_of_power' },
      { prompt: 'Evaluate: x^0', choices: ['0', 'x', '1'], answer: '1', law: 'zero_exponent' },
      { prompt: 'Rewrite with positive exponent: m^(−1)', choices: ['1/m', '−m', 'm'], answer: '1/m', law: 'negative_exponent' }
    ],
    [DIFFICULTY.MEDIUM]: [
      { prompt: 'Simplify: (2x)^2', choices: ['2x^2', '4x^2', 'x^4'], answer: '4x^2', law: 'power_of_product' },
      { prompt: 'Simplify: (y^3)^2', choices: ['y^5', 'y^6', 'y^9'], answer: 'y^6', law: 'power_of_power' },
      { prompt: 'Simplify: (a/b)^3', choices: ['a^3/b^3', 'a^3/b', 'a/b^3'], answer: 'a^3/b^3', law: 'power_of_quotient' },
      { prompt: 'Simplify: z^4 / z', choices: ['z^5', 'z^3', 'z^4'], answer: 'z^3', law: 'quotient' },
      { prompt: 'Simplify: t^2 · t', choices: ['t^3', 't^2', 't'], answer: 't^3', law: 'product' },
      { prompt: 'Rewrite: r^(1/2)', choices: ['√r', 'r^2', '1/√r'], answer: '√r', law: 'fractional_exponent' }
    ],
    [DIFFICULTY.HARD]: [
      { prompt: 'Simplify: (3a^2b)^2', choices: ['9a^4b^2', '6a^4b^2', '9a^2b^2'], answer: '9a^4b^2', law: 'power_of_product' },
      { prompt: 'Simplify: x^7 / x^(−2)', choices: ['x^9', 'x^5', 'x^(−9)'], answer: 'x^9', law: 'negative_exponent' },
      { prompt: 'Rewrite: 1 / y^(−3)', choices: ['y^3', '1/y^3', 'y^(−3)'], answer: 'y^3', law: 'negative_exponent' },
      { prompt: 'Simplify: (a/b)^(−2)', choices: ['b^2/a^2', 'a^2/b^2', 'ab^2'], answer: 'b^2/a^2', law: 'negative_exponent' },
      { prompt: 'Simplify: (p^(1/3))^6', choices: ['p^2', 'p^3', 'p^6'], answer: 'p^2', law: 'fractional_exponent' },
      { prompt: 'Simplify: a^5 · a^(−2)', choices: ['a^3', 'a^(−7)', 'a^7'], answer: 'a^3', law: 'product' },
      { prompt: 'Simplify: (x^2/y)^2', choices: ['x^4/y^2', 'x^2/y^4', 'x^4/y^4'], answer: 'x^4/y^2', law: 'power_of_quotient' }
    ]
  };

  const initialState = () => ({
    screen: SCREENS.INTRO,
    gemByLaw: Object.fromEntries(exponentLaws.map(l => [l.key, false])),
    selectedLevel: null,
    helpUsed: {}, // per key: mastery, easy, medium, hard
    score: { correct: 0, total: 0 },
    mistakes: {}, // law -> count
    quizIndex: 0,
    enemyHpRemaining: 0,
    answeredThisQuestion: false
  });

  let state = initialState();

  function setScreen(nextScreen) {
    state.screen = nextScreen;
    state.answeredThisQuestion = false;
    render();
  }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.remove('hidden');
    setTimeout(() => toastEl.classList.add('hidden'), 2200);
  }

  function openHelpOnce(levelKey) {
    if (!state.helpUsed[levelKey]) {
      state.helpUsed[levelKey] = true;
      showHelpModal();
    } else {
      toast("Your dragon already shared the scroll for this stage.");
    }
  }

  function showHelpModal() {
    lawsListEl.innerHTML = '';
    for (const law of exponentLaws) {
      const item = document.createElement('div');
      item.className = 'law';
      const title = document.createElement('div');
      title.innerHTML = `<strong>${law.title}</strong>`;
      const rule = document.createElement('div');
      rule.innerHTML = `<div class="small">${law.rule}</div>`;
      const note = document.createElement('div');
      note.innerHTML = `<div class="small">${law.note}</div>`;
      item.appendChild(title); item.appendChild(rule); item.appendChild(note);
      lawsListEl.appendChild(item);
    }
    helpModal.classList.remove('hidden');
  }

  closeHelpBtn.addEventListener('click', () => helpModal.classList.add('hidden'));

  // Screen renders
  function render() {
    if (state.screen === SCREENS.INTRO) return renderIntro();
    if (state.screen === SCREENS.WALKTHROUGH) return renderWalkthrough();
    if (state.screen === SCREENS.MASTERY) return renderMastery();
    if (state.screen === SCREENS.LEVEL_SELECT) return renderLevelSelect();
    if (state.screen === SCREENS.QUIZ) return renderQuiz();
    if (state.screen === SCREENS.FINAL) return renderFinal();
  }

  function renderIntro() {
    appRoot.innerHTML = `
      <div class="card hero">
        <div>
          <div class="header">
            <div class="dragon" aria-hidden="true">🐉</div>
            <div>
              <div class="title" style="font-size: 28px;">Welcome to Exponentia</div>
              <div class="subtitle">A kingdom powered by exponents is in peril.</div>
            </div>
          </div>
          <div class="story">
            The land of <strong>Exponentia</strong> shines with eight ancient laws. But three monsters have
            stolen the kingdom's clarity, spreading confusion across the realms of powers and roots.
            A dragon companion joins you on this quest—wise, friendly, and always watching your steps.
            Master the <strong>laws of exponents</strong>, earn the eight glowing <strong>gems</strong>, and defeat
            the enemies to restore balance.
          </div>
          <div class="pet-bar">
            <span class="pet-chip"><span style="font-size:18px">🐉</span> Your dragon guide is ready.</span>
          </div>
          <div class="footer">
            <button id="start-walkthrough" class="btn primary">Begin Quest</button>
            <span class="small">You will first learn the laws, then prove mastery.</span>
          </div>
        </div>
        <div class="aside">
          <div class="enemy">
            <div class="name">Enemies of Exponentia</div>
            <div class="small">- Mist Wraith (Easy)
              <br>- Logra the Confuser (Medium)
              <br>- The Null King (Hard)
            </div>
            <div class="hpbar" aria-hidden="true"><div class="hp" style="width: 65%"></div></div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('start-walkthrough').addEventListener('click', () => setScreen(SCREENS.WALKTHROUGH));
  }

  function renderWalkthrough() {
    const collectedCount = Object.values(state.gemByLaw).filter(Boolean).length;
    appRoot.innerHTML = `
      <div class="card">
        <div class="header">
          <div class="dragon">🐉</div>
          <div>
            <div class="title" style="font-size: 24px;">Walkthrough: The Eight Laws</div>
            <div class="subtitle">Study carefully. Your dragon can show this later once per stage.</div>
          </div>
        </div>
        <div class="laws-list">${exponentLaws.map(l => `
          <div class="law">
            <div class="tag">${l.title}</div>
            <div style="margin-top:6px"><strong>${l.rule}</strong></div>
            <div class="small">${l.note}</div>
          </div>
        `).join('')}</div>
        <div class="footer">
          <div class="gems" aria-label="Gems">
            ${exponentLaws.map(l => `<div class="gem ${state.gemByLaw[l.key] ? 'collected' : ''}" title="${l.title}"></div>`).join('')}
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button id="pet-help" class="btn pet-btn">Ask Dragon (show laws)</button>
            <button id="to-mastery" class="btn primary">Start Mastery Pre-Test</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('pet-help').addEventListener('click', () => openHelpOnce('walkthrough'));
    document.getElementById('to-mastery').addEventListener('click', () => {
      state.selectedLevel = 'mastery';
      state.quizIndex = 0;
      setScreen(SCREENS.MASTERY);
    });
  }

  function renderMastery() {
    const idx = state.quizIndex;
    const isDone = idx >= masteryQuestions.length;
    const collectedCount = Object.values(state.gemByLaw).filter(Boolean).length;
    if (isDone) {
      appRoot.innerHTML = `
        <div class="card">
          <div class="title" style="font-size:24px;">Pre-Test Complete</div>
          <div class="subtitle">You earned ${collectedCount}/8 gems. All gems unlock the path to the enemies.</div>
          <div class="gems" style="margin:12px 0;">
            ${exponentLaws.map(l => `<div class="gem ${state.gemByLaw[l.key] ? 'collected' : ''}" title="${l.title}"></div>`).join('')}
          </div>
          <div class="footer">
            <button id="repeat-mastery" class="btn">Practice Again</button>
            <button id="to-levels" class="btn primary" ${collectedCount === 8 ? '' : 'disabled'}>Go to Enemy Levels</button>
          </div>
        </div>
      `;
      document.getElementById('repeat-mastery').addEventListener('click', () => {
        state.quizIndex = 0;
        setScreen(SCREENS.MASTERY);
      });
      const toLevelsBtn = document.getElementById('to-levels');
      if (toLevelsBtn) toLevelsBtn.addEventListener('click', () => setScreen(SCREENS.LEVEL_SELECT));
      return;
    }

    const q = masteryQuestions[idx];
    appRoot.innerHTML = `
      <div class="card">
        <div class="header">
          <div class="dragon">🐉</div>
          <div>
            <div class="title" style="font-size: 22px;">Mastery Pre-Test</div>
            <div class="subtitle">Earn a gem for each law you master.</div>
          </div>
        </div>
        <div class="gems" style="margin-bottom:12px;">
          ${exponentLaws.map(l => `<div class="gem ${state.gemByLaw[l.key] ? 'collected' : ''}" title="${l.title}"></div>`).join('')}
        </div>
        <div class="card" style="background:#0f1730;">
          <div class="small" style="margin-bottom:6px;">Law: ${exponentLaws.find(l => l.key === q.law).title}</div>
          <div style="font-size: 18px; font-weight: 700; margin-bottom: 10px;">${q.prompt}</div>
          <div class="choices">
            ${q.choices.map((c, i) => `<div class="choice" data-index="${i}">${c}</div>`).join('')}
          </div>
          <div class="footer">
            <button id="pet-help" class="btn pet-btn">Ask Dragon (show laws)</button>
            <div class="small">Question ${idx + 1} of ${masteryQuestions.length}</div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('pet-help').addEventListener('click', () => openHelpOnce('mastery'));

    document.querySelectorAll('.choice').forEach(el => {
      el.addEventListener('click', () => {
        if (state.answeredThisQuestion) return;
        state.answeredThisQuestion = true;
        const choiceText = el.textContent.trim();
        const correct = choiceText === q.answer;
        updateScore(correct);
        if (correct) {
          state.gemByLaw[q.law] = true;
          el.classList.add('correct');
          toast('Gem acquired!');
        } else {
          el.classList.add('wrong');
          logMistake(q.law);
          toast(`Dragon notes a weakness: ${exponentLaws.find(l => l.key === q.law).title}`);
        }
        setTimeout(() => {
          state.quizIndex += 1;
          state.answeredThisQuestion = false;
          render();
        }, 700);
      });
    });
  }

  function renderLevelSelect() {
    const allGems = Object.values(state.gemByLaw).every(Boolean);
    appRoot.innerHTML = `
      <div class="card">
        <div class="header">
          <div class="dragon">🐉</div>
          <div>
            <div class="title" style="font-size: 24px;">Enemy Levels</div>
            <div class="subtitle">Choose your battle. All 8 gems required: ${allGems ? 'Yes' : 'No'}</div>
          </div>
        </div>
        <div class="grid cols-3">
          ${Object.values(enemies).map(e => `
            <div class="enemy">
              <div class="name">${e.name}</div>
              <div class="small">${e.description}</div>
              <div style="margin-top:8px;">
                <span class="badge ${e.key}">${e.key.toUpperCase()}</span>
              </div>
              <div class="hpbar"><div class="hp" style="width: 100%"></div></div>
              <div class="footer">
                <button class="btn primary" data-level="${e.key}" ${allGems ? '' : 'disabled'}>Battle</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.querySelectorAll('[data-level]').forEach(btn => {
      btn.addEventListener('click', () => startLevel(btn.getAttribute('data-level')));
    });
  }

  function startLevel(levelKey) {
    state.selectedLevel = levelKey;
    state.quizIndex = 0;
    state.enemyHpRemaining = enemies[levelKey].hp;
    setScreen(SCREENS.QUIZ);
  }

  function renderQuiz() {
    const levelKey = state.selectedLevel;
    const list = levelQuestionBank[levelKey];
    const idx = state.quizIndex;
    const isDone = idx >= list.length || state.enemyHpRemaining <= 0;

    if (isDone) {
      const defeated = state.enemyHpRemaining <= 0;
      appRoot.innerHTML = `
        <div class="card">
          <div class="title" style="font-size: 22px;">${defeated ? 'Enemy Defeated!' : 'Battle Complete'}</div>
          <div class="subtitle">${defeated ? enemies[levelKey].name + ' has fallen.' : 'You held your ground.'}</div>
          <div class="footer">
            <button id="to-levels" class="btn">Back to Levels</button>
            <button id="to-final" class="btn primary">Finish Adventure</button>
          </div>
        </div>
      `;
      document.getElementById('to-levels').addEventListener('click', () => setScreen(SCREENS.LEVEL_SELECT));
      document.getElementById('to-final').addEventListener('click', () => setScreen(SCREENS.FINAL));
      return;
    }

    const q = list[idx];
    const enemy = enemies[levelKey];
    const hpPct = Math.max(0, Math.round((state.enemyHpRemaining / enemy.hp) * 100));

    appRoot.innerHTML = `
      <div class="card">
        <div class="header">
          <div class="dragon">🐉</div>
          <div>
            <div class="title" style="font-size: 22px;">Battle: ${enemy.name}</div>
            <div class="subtitle">Defeat the monster by answering correctly.</div>
          </div>
        </div>

        <div class="enemy" style="margin-bottom:12px;">
          <div class="name">${enemy.name} <span class="badge ${levelKey}">${levelKey.toUpperCase()}</span></div>
          <div class="hpbar"><div class="hp" style="width: ${hpPct}%"></div></div>
          <div class="small">HP: ${state.enemyHpRemaining}/${enemy.hp}</div>
        </div>

        <div class="card" style="background:#0f1730;">
          <div class="small" style="margin-bottom:6px;">Focus law area: ${exponentLaws.find(l => l.key === q.law).title}</div>
          <div style="font-size: 18px; font-weight: 700; margin-bottom: 10px;">${q.prompt}</div>
          <div class="choices">
            ${q.choices.map((c, i) => `<div class="choice" data-index="${i}">${c}</div>`).join('')}
          </div>
          <div class="footer">
            <div style="display:flex; gap:8px; align-items:center;">
              <button id="pet-help" class="btn pet-btn">Ask Dragon (once per level)</button>
            </div>
            <div class="small">Question ${idx + 1} of ${list.length}</div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('pet-help').addEventListener('click', () => openHelpOnce(levelKey));

    document.querySelectorAll('.choice').forEach(el => {
      el.addEventListener('click', () => {
        if (state.answeredThisQuestion) return;
        state.answeredThisQuestion = true;
        const choiceText = el.textContent.trim();
        const correct = choiceText === q.answer;
        updateScore(correct);
        if (correct) {
          state.enemyHpRemaining = Math.max(0, state.enemyHpRemaining - 1);
          el.classList.add('correct');
          toast('A direct hit!');
        } else {
          el.classList.add('wrong');
          logMistake(q.law);
          toast(`Dragon logs a mistake in ${exponentLaws.find(l => l.key === q.law).title}.`);
        }
        setTimeout(() => {
          state.quizIndex += 1;
          state.answeredThisQuestion = false;
          render();
        }, 700);
      });
    });
  }

  function renderFinal() {
    const { correct, total } = state.score;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const enemiesDefeated = Object.values(enemies).filter(e => {
      // defeated if we ever reached 0 hp while on that level in this run
      // For this simple build, infer by: if score is decent and gems collected
      return Object.values(state.gemByLaw).every(Boolean) && pct >= 60;
    }).length;

    const mistakeEntries = Object.entries(state.mistakes).sort((a,b) => b[1]-a[1]);

    const saved = pct >= 60 && Object.values(state.gemByLaw).every(Boolean);

    appRoot.innerHTML = `
      <div class="card">
        <div class="header">
          <div class="dragon">🐉</div>
          <div>
            <div class="title" style="font-size: 24px;">${saved ? 'Exponentia is Saved!' : 'A Valient Effort'}</div>
            <div class="subtitle">${saved ? 'Your mastery restored clarity to the kingdom.' : 'Keep training and try again.'}</div>
          </div>
        </div>

        <div class="grid cols-2">
          <div class="card">
            <div style="font-weight:800; margin-bottom:6px;">Score Report</div>
            <div class="small">Correct: ${correct} / ${total} (${pct}%)</div>
            <div style="margin:8px 0;">
              <div class="progress"><div style="width: ${pct}%"></div></div>
            </div>
            <div class="gems" style="margin-top:8px;">
              ${exponentLaws.map(l => `<div class="gem ${state.gemByLaw[l.key] ? 'collected' : ''}" title="${l.title}"></div>`).join('')}
            </div>
          </div>
          <div class="card">
            <div style="font-weight:800; margin-bottom:6px;">Dragon's Report</div>
            ${mistakeEntries.length === 0 ? '<div class="small">No weaknesses detected. Great work!</div>' : ''}
            <div class="grid">
              ${mistakeEntries.map(([lawKey, count]) => {
                const lawTitle = exponentLaws.find(l => l.key === lawKey)?.title || lawKey;
                return `<div class="law"><div><strong>${lawTitle}</strong></div><div class="small">Mistakes: ${count}</div></div>`;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="footer">
          <button id="play-again" class="btn">Play Again</button>
        </div>
      </div>
    `;

    document.getElementById('play-again').addEventListener('click', () => {
      state = initialState();
      setScreen(SCREENS.INTRO);
    });
  }

  function updateScore(correct) {
    state.score.total += 1;
    if (correct) state.score.correct += 1;
  }

  function logMistake(lawKey) {
    state.mistakes[lawKey] = (state.mistakes[lawKey] || 0) + 1;
  }

  // Boot
  render();
})();
