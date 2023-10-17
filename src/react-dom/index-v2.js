// Step II: The render Function
// 递归渲染的问题：同步渲染，递归树结构一旦开始，不能中断，阻塞主线程
// Once we start rendering, we won’t stop until 
// we have rendered the complete element tree. If 
// the element tree is big, it may block the main 
// thread for too long. And if the browser needs to 
// do high priority stuff like handling user input 
// or keeping an animation smooth, it will have to 
// wait until the render finishes.
function render(element, container) {
  const { type, props } =  element;
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
  // 存在的问题：同步渲染，递归树结构一旦开始，不能中断
  const { children = [] } = props;
  children.forEach(child => {
    render(child, dom);
  })

  // 追加到父节点上，渲染元素
  container.appendChild(dom);
}

export {
  render
}
