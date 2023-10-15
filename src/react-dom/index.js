function render(element, container) {
  const { type, props = {} } = element;
  // 创建元素
  const dom = type === 'TEXT_ELEMENT' ? 
    document.createTextNode('') :
    document.createElement(type);

  // 元素添加属性
  Object.keys(props).forEach(key => {
    if (key !== 'children') {
      dom[key] = props[key];
    }
  });

  // 递归渲染子元素
  props.children.forEach(child => render(child, dom));

  // 渲染元素
  container.appendChild(dom);
}

export {
  render
}