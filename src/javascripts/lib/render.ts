export type Frequencies = { [char: string]: number };

export const render = ({ period }) => {
  const letter = (x: string, frequency: number) => `
    <span
      data-key='${(x === " " ? "_" : x) + frequency}'
      class='letter'
      style='transition-duration: ${period / 2}ms'
    >
      ${x === " " ? "&nbsp;" : x}
    </span>
  `;

  const word = (x: string, frequencies: Frequencies) => {
    const chars = x.split("");

    return `
      <div class='word'>
        ${chars
          .map((char) => {
            const frequency = (frequencies[char] =
              (frequencies[char] || 0) + 1);
            return letter(char, frequency);
          })
          .join("")}
      </div>
    `;
  };

  const line = (x: string, frequencies: Frequencies) => {
    return `
      <div class='line'>
        ${x
          .split(" ")
          .map((w) => word(w, frequencies))
          .join(word(" ", {}))}
      </div>
    `;
  };

  const phrase = (x: string) => {
    const frequencies: Frequencies = {};

    return `
      <div class='phrase'>
        ${x
          .split("\n")
          .map((l) => line(l, frequencies))
          .join("")}
      </div>
    `;
  };

  return { letter, word, line, phrase };
};

export default render;
