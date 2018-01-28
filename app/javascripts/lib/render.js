export default ({ period }) => {
  const letter = (x, frequency) => `
    <span
      data-key='${(x === ' ' ? '_' : x) + frequency}'
      class='letter'
      style='transition-duration: ${period / 2}ms'
    >
      ${x === ' ' ? '&nbsp;' : x}
    </span>
  `;

  const word = (x, frequencies) => {
    const tokens = x.split('');

    return `
      <div class='word'>
        ${tokens.map(x => {
          const frequency = frequencies[x] = (frequencies[x] || 0) + 1;
          return letter(x, frequency);
        }).join('')}
      </div>
    `;
  };

  const line = (x, frequencies) => {
    return `
      <div class='line'>
        ${x.split(' ').map(w => word(w, frequencies)).join(word(' ', {}))}
      </div>
    `;
  };

  const phrase = x => {
    const frequencies = {};

    return `
      <div class='phrase'>
        ${x.split('\n').map(l => line(l, frequencies)).join('')}
      </div>
    `;
  };

  return {
    letter,
    word,
    line,
    phrase,
  };
};
