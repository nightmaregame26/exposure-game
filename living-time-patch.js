(() => {
  'use strict';

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
    document.getElementById('resetBtn')?.addEventListener('click', () => {
      localStorage.removeItem('exposure-social-matrix-v1');
      localStorage.removeItem('exposure-appointments-v1');
      localStorage.removeItem('exposure-last-seen-v1');
      localStorage.removeItem('exposure-memory-book-v1');
      localStorage.removeItem('exposure-prologue-complete-v1');
      localStorage.removeItem('exposure-prologue-1-1-migrated');
    }, true);

    window.setInterval(() => {
      let stamina = 100;
      try { stamina = Number(state.stamina || 0); } catch {}
      document.querySelectorAll('#tasks button').forEach(button => {
        const title = button.childNodes[0]?.textContent?.trim() || '';
        if (!(title in taskCosts)) return;
        button.disabled = stamina - taskCosts[title] < 0;
      });
    }, 500);
  });
})();
