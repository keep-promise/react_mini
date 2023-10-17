// Step I: The createElement Function
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

// The children array could also contain primitive 
// values like strings or numbers. So we’ll wrap everything 
// that isn’t an object inside its own element and create a 
// special type for them: TEXT_ELEMENT.
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

export {
  createElement
};
