/** @type {import("lint-staged").Configuration} */
const config = {
  '*.{md,mdx}': ['markdownlint-cli2 --fix', 'prettier --write'],
  '*.{json,jsonc,yaml,yml,js,mjs,cjs}': 'prettier --write',
};

export default config;
