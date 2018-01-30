import $ from 'jquery';
import { map, intersection, without, difference, partialRight, defer } from 'lodash';
import parameters from 'queryparams';

import render from './lib/render';

window.parameters = parameters;

export default () => {
  const CONFIG = parameters({
    period: 2500,
    fontFamily: 'inherit',
    backgroundColor: 'white',
    color: 'black',
    phrases: [
      'abcdef\nghijkl\nmnopqr\nstuvwx\nyz',
      'ybcdef\nahijkl\ngnopqr\nmtuvwx\nsz',
      'sbcdef\nyhijkl\nanopqr\ngtuvwx\nmz',
      'mbcdef\nshijkl\nynopqr\natuvwx\ngz',
      'gbcdef\nmhijkl\nsnopqr\nytuvwx\naz',
    ],
  });

  const DOM = {
    body: $('body'),
    app: $('#app'),
  };

  const STATE = {
    i: -1,
  };

  DOM.body.css({
    backgroundColor: CONFIG.backgroundColor,
    color: CONFIG.color,
  });

  DOM.app.css({
    fontFamily: CONFIG.fontFamily,
  });

  const tokenize = word => {
    const tokens = word.split('');
    const frequencies = {};

    return tokens.map(x => {
      const frequency = (frequencies[x] = (frequencies[x] || 0) + 1);

      return {
        token: x,
        frequency,
        key: `${x}${frequency}`,
      };
    });
  };

  const take = partialRight(map, 'key');

  const TRANSFORMATIONS = CONFIG.phrases.map((current, i) => {
    const next = CONFIG.phrases[i + 1] || CONFIG.phrases[0];

    const tokens = {
      current: tokenize(current),
      next: tokenize(next),
    };

    const moving = intersection(take(tokens.current), take(tokens.next));
    const adding = without(take(tokens.next), ...take(tokens.current));
    const removing = difference(take(tokens.current), take(tokens.next));

    return { tokens, current, next, moving, adding, removing };
  });

  const renderer = render({ period: CONFIG.period });

  const step = (state, transformations) => {
    const { i } = state;
    state.i = i + 1 < transformations.length ? i + 1 : 0;

    const { current, next, moving, adding, removing } = TRANSFORMATIONS[state.i];

    const $current = $(`
      <div class='current'>
        ${renderer.phrase(current)}
      </div>
    `);

    const $next = $(`
      <div class='next'>
        ${renderer.phrase(next)}
      </div>
    `);

    DOM.app.html([
      $current,
      $next,
    ]);

    defer(() => {
      adding.forEach(key => {
        $next.find(`.letter[data-key='${key}']`)
          .attr('data-state', 'adding');
      });

      removing.forEach(key => {
        $current.find(`.letter[data-key='${key}']`)
          .attr('data-state', 'removing');
      });

      moving.forEach(key => {
        if (key[0].match(/\s/)) return;

        const $from = $current.find(`.letter[data-key='${key}']`);
        const $to = $next.find(`.letter[data-key='${key}']`);

        const x = $to.offset().left - $from.offset().left;
        const y = $to.offset().top - $from.offset().top;

        $from.css({ transform: `translate(${x}px, ${y}px)` });
      });
    });

    return state;
  };

  DOM.app.html(`
    <div class='current'>
      ${renderer.phrase(CONFIG.phrases[0])}
    </div>
  `);

  setInterval(() => step(STATE, TRANSFORMATIONS), CONFIG.period);
};
