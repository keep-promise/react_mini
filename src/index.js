import { createElement } from './react';

const element = createElement(
  'h1', 
  { id: 'title', class: 'hello' },
  'hello word',
  createElement(h2)
);

console.log('element', element);