
(function () {
  'use strict';
  var mount = document.getElementById('bb-react-treat-finder');
  if (!mount || !window.React || !window.ReactDOM) return;

  var h = window.React.createElement;
  var picks = {
    chocolate: {
      title: 'Chocolate comfort',
      description: 'Try the Chocolate Truffle Cake or Double Chocolate Cupcake.',
      link: 'html/cakes.html',
      label: 'Explore chocolate bakes'
    },
    fruity: {
      title: 'Fresh & fruity',
      description: 'Strawberry Cream Cake and Lemon Berry Cupcake bring a bright, fruity finish.',
      link: 'html/cakes.html',
      label: 'Explore fruity bakes'
    },
    savoury: {
      title: 'Something savoury',
      description: 'Browse hand-stretched pizza and freshly baked breads for a savoury treat.',
      link: 'html/pizza.html',
      label: 'Explore savoury bakes'
    },
    drink: {
      title: 'A cosy sip',
      description: 'Pair your favourite bake with handcrafted coffee, tea or a comforting hot drink.',
      link: 'html/coffee.html',
      label: 'Explore drinks'
    }
  };

  function TreatFinder() {
    var state = window.React.useState('chocolate');
    var selected = state[0];
    var setSelected = state[1];
    var item = picks[selected];
    return h('section', { className: 'container section-tight', 'aria-labelledby': 'treat-finder-title' },
      h('div', { className: 'panel-glass bb-treat-finder', 'data-reveal': true },
        h('p', { className: 'eyebrow' }, 'A little help choosing'),
        h('h2', { className: 'section-title', id: 'treat-finder-title' }, 'Find Your Bakery Mood'),
        h('p', { className: 'lead-text' }, 'Choose what you are craving and we will suggest where to start.'),
        h('div', { className: 'bb-treat-options', role: 'group', 'aria-label': 'Choose a bakery craving' },
          Object.keys(picks).map(function (key) {
            return h('button', {
              key: key,
              type: 'button',
              className: 'btn-soft bb-treat-choice' + (selected === key ? ' is-selected' : ''),
              'aria-pressed': selected === key ? 'true' : 'false',
              onClick: function () { setSelected(key); }
            }, ({ chocolate: 'Chocolate', fruity: 'Fruity', savoury: 'Savoury', drink: 'A drink' })[key]);
          })
        ),
        h('div', { className: 'bb-treat-result', 'aria-live': 'polite' },
          h('h3', null, item.title),
          h('p', null, item.description),
          h('a', { className: 'btn-gold', href: item.link }, item.label)
        )
      )
    );
  }

  var app = window.React.createElement(TreatFinder);
  if (window.ReactDOM.createRoot) window.ReactDOM.createRoot(mount).render(app);
  else window.ReactDOM.render(app, mount);
})();
