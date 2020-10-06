import './styles.scss';
import '../node_modules/normalize.css/normalize.css';
import * as data from './data.json';

const nav = document.querySelector('nav');
const animPath = nav.querySelector('svg path');
const timeline = document.querySelector('.timeline');
const blob = timeline.querySelector('.blob');
const cards = document.querySelectorAll('.item');
const dots = [];
const configs = { speed: 8, details: 18 };
const birth = 6168087e5;
let animTime = 0;
let currentColor = 0;

const app = {
  init: () => {
    // Header age
    app.setAge();

    // Stats
    // app.initStats();

    // Nav animation init
    app.navAnimation();

    // Read more / less
    app.initReadMoreLinks();

    // Footer Links
    app.initFooterLinks();

    // Timeline
    app.timeline.init();

    // On scroll event
    app.onScroll.init();
  },

  navAnimation: () => {
    const xs = [];
    let x = 0;
    const w = document.body.clientWidth;
    const wm = w / 2;

    if (window.innerWidth <= 1280) {
      // Mobile
      for (x = 0; x < w; x += configs.details * 0.6) {
        xs.push([
          x,
          110 + ((12 * x) / w) * Math.sin((x + animTime) / 50),
        ]);
      }
      xs.push([w, 110 + 12 * Math.sin((w + animTime) / 50)]);
    } else {
      // Desktop
      for (x = 0; x < wm; x += configs.details) {
        xs.push([
          x,
          120 + ((32 * x) / wm) * Math.sin((x + animTime) / 50),
        ]);
      }
      xs.push([wm, 120 + 32 * Math.sin((wm + animTime) / 50)]);
      for (let i = xs.length - 1; i > 0; i -= 1) {
        xs.push([w - xs[i][0], xs[i][1]]);
      }
    }

    // Set path
    animPath?.setAttribute('d', `M0 152 ${xs.map(p => `${p[0]} ${p[1]}`).join(' L')} h${w} V0 H0`);

    if (configs.speed > 1) configs.speed *= 0.95;

    animTime += configs.speed;
    requestAnimationFrame(app.navAnimation);
  },

  initReadMoreLinks: () => {
    document.querySelectorAll('.read').forEach(read => {
      if (read.childElementCount < 2) {
        read.classList.remove('read');
      } else {
        const more = document.createElement('p');
        more.className = 'read-more';
        read.querySelectorAll('div')[0]?.insertAdjacentElement('afterend', more);

        const less = document.createElement('p');
        less.className = 'read-less';
        read.querySelectorAll('div')[1]?.appendChild(less);

        read.querySelectorAll('.read-more, .read-less').forEach(
          p => p.onclick = () => {
            p.closest('.read').classList.toggle('active');
            app.timeline.setPositions();
            app.onScroll.timeline();
          }
        );
      }
    });
  },

  initFooterLinks: () => {
    document.querySelectorAll('footer .icons .link').forEach(elem => {
      elem.onmousemove = e => {
        const span = elem.nextElementSibling;
        span.style.left = `${e.offsetX}px`;
        span.style.top = `${e.offsetY}px`;
      };
    });
  },

  onScroll: {
    init: () => {
      (document.onscroll = () => {
        app.onScroll.timeline();
        app.onScroll.sections();
      })();
    },

    timeline: () => {
      const pos = Math.max(0, window.pageYOffset - timeline.offsetTop + nav.offsetHeight + 60);
      const max = document.body.offsetHeight
        - window.innerHeight
        - timeline.offsetTop
        + nav.offsetHeight
        + 60;
      const percent = timeline.offsetHeight * (pos / (max + 200));

      for (let i = 0; i < cards.length; i += 1) {
        if (cards[i].offsetTop > percent) {
          blob.style.setProperty('--position', `${dots[i].offsetTop || 0}px`);

          cards.forEach(item => item.classList.remove('active'));
          cards[i].classList.add('active');

          dots.forEach(dot => dot.classList.remove('active'));
          dots[i].classList.add('active');

          break;
        }
      }

      for (let i = 0; i < cards.length; i += 1) {
        if (cards[i].offsetTop <= percent + 460) {
          cards[i].classList.add('on');
        }
      }
    },

    sections: () => {
      const yPos = window.pageYOffset;
      const breaks = [
        timeline.offsetTop - 200,
        document.body.offsetHeight - window.innerHeight - 200,
      ];
      let anim;

      if (yPos < breaks[0]) {
        if (currentColor > 0) {
          anim = 'BA';
          currentColor = 0;
        }
      } else if (yPos > breaks[0] && yPos < breaks[1]) {
        if (currentColor === 0) {
          anim = 'AB';
          currentColor = 1;
        } else if (currentColor === 2) {
          anim = 'CB';
          currentColor = 1;
        }
      } else if (currentColor < 2) {
        anim = 'BC';
        currentColor = 2;
      }

      if (anim) {
        document
          .querySelectorAll(`.anim${anim}`)
          .forEach(e => e.beginElement());
      }
    },
  },

  setAge: () => {
    window.age.innerHTML = new Date(Date.now() - 6167232e5).getUTCFullYear() - 1970;
  },

  initStats: () => {
    const { stats } = data;

    // Fill function
    const fillStatsRow = (row, rows) => {
      const box = document.querySelector(`.stats [data="${row}"]`);
      box
        .querySelectorAll('em')
        .forEach((elem, i) => { if (rows[i]) elem.innerHTML = rows[i]; });
      box.classList.add('active');
    };

    // Proper number display
    const numberFormat = n => new Intl.NumberFormat('uk').format(Math.round(n));
    const numberFixed = n => n.toFixed(2).replace(/\.?0+$/, '');

    // Current age
    const age = new Date().getTime() - birth;

    // Stackoverflow
    fetch(
      'https://api.stackexchange.com/2.2/users/1192479?site=stackoverflow'
    ).then(response => response.json().then(json => {
      const diff = (new Date() / 1000 - new Date(json.items[0].last_access_date)) / 60;
      let divider; let unit;

      if (diff < 60) {
        divider = 1;
        unit = 'minute';
      } else if (diff < 1440) {
        divider = 60;
        unit = 'hour';
      } else {
        divider = 1440;
        unit = 'day';
      }

      const value = (diff / divider) | 0;

      fillStatsRow('stackoverflow', [
        value > 0
          ? `${value} ${unit}${value !== 1 ? 's' : ''} ago`
          : 'just now',
        json.items[0].reputation,
        json.items[0].badge_counts.gold,
        json.items[0].badge_counts.silver,
        json.items[0].badge_counts.bronze,
      ]);
    }));

    // Github
    Promise.all(
      [
        'https://api.github.com/users/promatik',
        'https://api.github.com/users/promatik/orgs',
        'https://api.github.com/users/promatik/repos?per_page=100',
      ].map(u => fetch(u).then(response => response.json()))
    ).then(responses => {
      fillStatsRow('github', [
        responses[2]
          .map(repo => repo.stargazers_count)
          .reduce((a, b) => a + b),
        responses[2].map(repo => repo.forks).reduce((a, b) => a + b),
        responses[0].public_repos,
        responses[0].public_gists,
        responses[1].length,
      ]);
    });

    // Car
    const km = Object.values(stats.car.km).reduce((a, b) => a + b)
      + ((Date.now() - new Date(stats.car.current_average.since)) / 8784e4)
        * stats.car.current_average.value;
    const hours = km / 62;

    fillStatsRow('car', [
      numberFormat(km),
      numberFormat(hours),
      numberFixed(hours / (age / 36e7)),
    ]);

    // Airplane
    fillStatsRow('airplane', [
      numberFormat(stats.airplane.km),
      stats.airplane.flights,
      stats.airplane.countries.length,
      stats.airplane.continents.length,
      stats.airplane.islands.length,
    ]);

    // Map
    const days = age / 864e5;
    let abroad = Object.values(stats.map.abroad).reduce((a, b) => a + b);
    if (stats.map.living_abroad_since) {
      const d = (new Date() - new Date(stats.map.living_abroad_since)) / 864e5;
      abroad += d;
    }
    fillStatsRow('map', [
      numberFormat(days - abroad),
      numberFormat(abroad),
      numberFixed((abroad / days) * 100),
    ]);

    // Profile
    const values = {
      sleeping: 0,
      eating: 0,
      working: 0,
      studing: 0,
      exercising: 0,
      commuting: 0,
      coding: 0,
    };
    Object.keys(values).forEach(key => {
      stats.profile[key].forEach(entry => {
        const init = new Date(entry.range[0]);
        const end = entry.range.length > 1 ? new Date(entry.range[1]) : new Date();
        values[key] += ((end - init) * entry.average) / 14.4;
      });
    });

    fillStatsRow(
      'profile',
      Object.values(values).map(e => numberFixed(e / age))
    );
  },

  timeline: {
    init: () => {
      app.timeline.initDots();
      app.timeline.initDates();
      app.timeline.initClock();
      app.timeline.setPositions();
    },

    initDots: () => {
      const container = timeline.querySelector('.dots');

      cards.forEach(() => {
        const dot = document.createElement('div');
        container.appendChild(dot);
        dots.push(dot);
      });
    },

    initDates: () => {
      const dates = timeline.querySelectorAll('.item .date');

      const dateFormatter = date => `${date.toLocaleString('en-UK', { month: 'short' })} ${date.getFullYear()}`;

      dates.forEach(item => {
        const dateA = new Date(item.getAttribute('start'));
        const dateB = item.getAttribute('end') ? new Date(item.getAttribute('end')) : new Date();

        // Date formatting
        let result = dateFormatter(dateA);
        if (dateA.getDate() !== dateB.getDate()) { result += ` → ${item.getAttribute('end') ? dateFormatter(dateB) : 'Current'}`; }

        // Current
        const diff = (dateB - dateA) / 31536e6;
        const y = diff | 0;
        const m = ((diff % 1) * 12) | 0;
        result += y + m
          ? ` (${y ? `${y} year${y > 1 ? 's' : ''}` : ''}${m ? `${(y ? ', ' : '') + m} month${m > 1 ? 's' : ''}` : ''})`
          : '';

        item.innerText = result;
      });
    },

    initClock: () => {
      setInterval(() => {
        window.elapsed.innerHTML = (((new Date().getTime() - birth) / 1e3) | 0)
          .toLocaleString()
          .replace(/,/g, ' ');
      }, 1e3);
    },

    setPositions: () => {
      cards.forEach((card, i) => dots[i].style.top = `${card.offsetTop + 10}px`);
    },
  },
};

app.init();
