import { createElement } from './react';
import { render } from './react-dom';


const element = createElement(
  'h1', 
  { id: 'aaa', class: 'bbb' },
  'hello react',
  createElement('div', {}, 'div')
);

console.log('element', element);

render(element, document.getElementById('root'));