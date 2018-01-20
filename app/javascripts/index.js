import $ from 'jquery';
import parameters from 'queryparams';

window.parameters = parameters;

let word = string => {
  let letters = string.split('');

  let frequencyMap = {};

  let _word = letters.map(letter => {
    let freq = frequencyMap[letter] = (frequencyMap[letter] || 0) + 1;
    if (letter === ' ') return '<br>';
    return `<span data-letter='${letter + freq}' class='letter'>${letter}</span>`
  }).join('');


  return `<div class='word'>
    ${_word}
  </div>`;
};

export default () => {
  const { lines } = parameters({
    lines: ['britneyspears', 'presbyterians'],
  });

  const $app = $('#app');

  const transform = ($from, $to, i) => {
    $from.css({ opacity: 1 });

    // Gather positioning information
    let params = $to
      .find('.letter')
      .map((i, el) => {
        let $letter = $(el);
        let letter = $letter.data('letter');

        let $corresponding = $from.find(`[data-letter="${letter}"]`);

        if ($corresponding.length) {

          let { top, left } = $corresponding.offset();
          let x = $letter.offset().left - left;
          let y = $letter.offset().top - top;

          return {
            $el: $corresponding,
            letter: letter,
            top: top,
            left: left,
            x: x,
            y: y,
            to: `translate(${x}px, ${y}px)`
          };
        }
      })
      .get();

    return () => {
      // Apply transformation
      $.map(params, ({ $el, top, left, to }) => {
        $el.css({
          position: 'absolute',
          top: top,
          left: left,
          transform: to
        });
      });
    };
  };

  let $lines = lines.map(line => {
    let $line = $(word(line));
    $app.append($line)
    return $line;
  });

  let transformations = $lines.map(($el, i) => {
    return transform($lines[0], $el, i);
  });

  var i = 1;
  transformations[0]();
  setInterval(() => {
    transformations[i]()
    i = i + 1 < transformations.length ? i + 1 : 0;
  }, 2000);
};
