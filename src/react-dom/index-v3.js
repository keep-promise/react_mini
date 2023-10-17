// Step III: Concurrent Mode
// 递归渲染的问题：同步渲染，递归树结构一旦开始，不能中断
// 解法：react提出fiber架构：把整个渲染过程拆分成一个一个小单元（任务）
// 每当完成一个小任务，浏览器可以中断，去优先响应重要任务（用户响应）
// 一个小单元（任务）就是一个fiber

// fiber解决同步渲染的问题，优化成异步渲染，链表【return、child、sibling】
// 每一个element都是一个节点，转成链表结构
// 结构：树 -》平铺结构
// 异步渲染：类似 requestIdleCallback
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

// 调度渲染实现
let nextUnitOfWork = null; // 下一次渲染的节点

// 调度函数
function workLoop(deadLine) {
  let shouldYield = false; // 是否中断
  // 有工作且不应该中断
  while(!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork); // 做工作
    shouldYield = deadLine.timeRemaining() < 1; // 剩余时间小于1ms，要中断
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
