import $ from 'jquery';
import { map, intersection, without, difference, partialRight, defer } from 'lodash';
import parameters from 'queryparams';

import render from './lib/render';

window.parameters = parameters;

export default () => {
  const { phrases, font, period } = parameters({
    period: 2500,
    font: 'inherit',
    phrases: [
      'abcdef\nghijkl\nmnopqr\nstuvwx\nyz',
      'ybcdef\nahijkl\ngnopqr\nmtuvwx\nsz',
      'sbcdef\nyhijkl\nanopqr\ngtuvwx\nmz',
      'mbcdef\nshijkl\nynopqr\natuvwx\ngz',
      'gbcdef\nmhijkl\nsnopqr\nytuvwx\naz',
    ],
  });

  const DOM = {
    app: $('#app'),
  };

  const STATE = {
    i: -1,
  };

  DOM.app.css({ fontFamily: font });

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

  const TRANSFORMATIONS = phrases.map((current, i) => {
    const next = phrases[i + 1] || phrases[0];

    const tokens = {
      current: tokenize(current),
      next: tokenize(next),
    };

    const moving = intersection(take(tokens.current), take(tokens.next));
    const adding = without(take(tokens.next), ...take(tokens.current));
    const removing = difference(take(tokens.current), take(tokens.next));

    return { tokens, current, next, moving, adding, removing };
  });

  const renderer = render({ period });

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

    adding.forEach(key => {
      defer(() => {
        $next.find(`.letter[data-key='${key}']`)
          .attr('data-state', 'adding');
      });
    });

    removing.forEach(key => {
      defer(() => {
        $current.find(`.letter[data-key='${key}']`)
          .attr('data-state', 'removing');
      });
    });

    moving.forEach(key => {
      if (key[0].match(/\s/)) return;

      const $from = $current.find(`.letter[data-key='${key}']`);
      const $to = $next.find(`.letter[data-key='${key}']`);

      const x = $to.offset().left - $from.offset().left;
      const y = $to.offset().top - $from.offset().top;

      $from.css({ transform: `translate(${x}px, ${y}px)` });
    });

    return state;
  };

  step(STATE, TRANSFORMATIONS);
  setInterval(() => step(STATE, TRANSFORMATIONS), period);
};
