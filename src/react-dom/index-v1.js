// 递归渲染的问题：同步渲染，递归树结构一旦开始，不能中断
// Once we start rendering, we won’t stop until 
// we have rendered the complete element tree. If 
// the element tree is big, it may block the main 
// thread for too long. And if the browser needs to 
// do high priority stuff like handling user input 
// or keeping an animation smooth, it will have to 
// wait until the render finishes.

// fiber解决同步渲染的问题，优化成异步渲染，链表【return、child、sibling】
// 每一个element都是一个节点，转成链表结构
// 结构：树 -》平铺结构
// 异步渲染：类似 requestIdleCallback

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
  // 存在的问题：同步渲染，递归树结构一旦开始，不能中断
  // props.children.forEach(child => render(child, dom));

  // 渲染元素
  container.appendChild(dom);
}

// 调度渲染实现
let nextUnitOfWork = null; // 下一次渲染的节点

// 调度函数
function wookLoop(deadLine) {
  let shouldYield = false; // 是否中断
  // 有工作且不应该中断
  while(!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork); // 做工作
    shouldYield = deadLine.timeRemaining() > 1; // 是否还有剩余时间
  }
  // 没有足够的时间，请求下一次浏览器空闲时间调度
  requestIdleCallback(workLoop);
}

// 第一次浏览器空闲时间调度
requestIdleCallback(workLoop);

// 渲染节点，并返回下一个需要渲染的节点
function performUnitOfWork(work) {

}


export {
  render
}