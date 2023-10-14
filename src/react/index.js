function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === 'object' ? child : createTextElement(child)
      })
    }
  }
}

// 如果传入的是纯文字，不想转成innerText模式，因此需要createTextElement
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

const React = {
  createElement
};

export default React;
