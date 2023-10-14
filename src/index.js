import React from './react';

const { createElement } = React;

const element = createElement(
  'h1', 
  { id: 'aaa', class: 'bbb' },
  'hello react',
  createElement('div')
);

console.log('element', element);