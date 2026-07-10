(() => {
  'use strict';

  const START_DATE_KEY = 'exposure-living-start-date-v1';
  const taskCosts = {
    'Meet Emily at Café Hollow':8,
    "Visit Noah's house":18,
    'Search Blackwood Forest':32,
    'Visit Detective Mason':8,
    'Ask Alex about old roads':6,
    'Talk to Mara Bell':5,
    'Help Sarah with article':12,
    'Follow anonymous text':25,
    'Library research':10,
    'Rest at home':-30
  };

  if (!localStorage.getItem(START_DATE_KEY)) {
    localStorage.setItem(START_DATE_KEY, localDateKey(new Date()));
  }

  const originalStartTask = window.startTask;
  if (typeof originalStartTask === 'function') {
    window.startTask = function livingTimeStartTask(task) {
      const now = new Date();
      const realMinutes = now.getHours() * 60 + now.getMinutes();
      try {
        if (state.time + task.t > 1440) state.time = Math.max(0, 1440 - task.t);
        originalStartTask(task);
        state.time = realMinutes;
        save?.();
      } catch (error) {
        console.error('Living Time task execution failed', error);
      }
      window.setTimeout(() => {
        const time = document.getElementById('time');
        if (time) time.textContent = new Intl.DateTimeFormat(undefined, { hour:'numeric', minute:'2-digit' }).format(new Date());
      }, 20);
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const bootstrap = window.setInterval(() => {
      try {
        if (!state?.people || !Array.isArray(state.messages)) return;
        if (!state.messages.some(message => message.from === 'Emily Hart')) {
          state.messages.unshift({
            from:'Emily Hart',
            text:'You spoke to Noah last night. Café Hollow, 10:00. Please come alone. I need to know what he left with you.',
            threat:false
          });
          save?.();
          render?.();
        }
        syncLivingDay();
        window.clearInterval(bootstrap);
      } catch {}
    }, 150);

    document.getElementById('resetBtn')?.addEventListener('click', () => {
      window.setTimeout(() => {
        if (localStorage.getItem('exposure-alpha-04')) return;
        localStorage.removeItem('exposure-social-matrix-v1');
        localStorage.removeItem('exposure-appointments-v1');
        localStorage.removeItem('exposure-last-seen-v1');
        localStorage.removeItem('exposure-memory-book-v1');
        localStorage.removeItem('exposure-prologue-complete-v1');
        localStorage.removeItem('exposure-prologue-1-1-migrated');
        localStorage.removeItem(START_DATE_KEY);
      }, 50);
    });

    window.setInterval(() => {
      let stamina = 100;
      try { stamina = Number(state.stamina || 0); } catch {}
      document.querySelectorAll('#tasks button').forEach(button => {
        const title = button.childNodes[0]?.textContent?.trim() || '';
        if (title.startsWith('🌙 End Day')) {
          button.style.display = 'none';
          return;
        }
        if (!(title in taskCosts)) return;
        button.disabled = stamina - taskCosts[title] < 0;
      });

      syncLivingDay();

      const livingClock = document.getElementById('livingClockLine');
      const statusCard = document.getElementById('time')?.closest('.card');
      if (livingClock && statusCard && livingClock.parentElement !== statusCard) statusCard.appendChild(livingClock);
    }, 500);
  });

  function syncLivingDay() {
    try {
      const start = parseLocalDate(localStorage.getItem(START_DATE_KEY));
      const today = parseLocalDate(localDateKey(new Date()));
      const dayNumber = Math.max(1, Math.floor((today - start) / 86400000) + 1);
      state.day = dayNumber;
      const day = document.getElementById('day');
      if (day) day.textContent = String(dayNumber);
      save?.();
    } catch {}
  }

  function localDateKey(date) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  }

  function parseLocalDate(value) {
    const [year, month, day] = String(value).split('-').map(Number);
    return new Date(year, month - 1, day);
  }
})();
