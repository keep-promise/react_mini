// fiber解决同步渲染的问题，优化成异步渲染，链表【return、child、sibling】
// 每一个element都是一个节点，转成链表结构
// 结构：树 -》平铺结构
// 异步渲染：类似 requestIdleCallback

// 基于fiber创建真实dom
function createDOM(fiber) {
  const { type, props = {} } = fiber;
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

  return dom;
}

// 
function render(element, container) {
  // 初始化第一个fiber-->root fiber
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element]
    },
    sibiling: null, 
    child: null,
    parent: null
  };
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

// 渲染fiber节点，并返回下一个需要渲染的fiber节点
function performUnitOfWork(fiber) {
  // 创建dom元素
  if(!fiber.dom) {
    fiber.dom = createDOM(fiber);
  }

  // 追加父节点
  if(fiber.parent) {
    fiber.parent.dom.append(fiber.dom);
  }

  // children创建fiber
  const children = fiber.props.children;
  let preSibling = null;

  // 构建fiber，并建立联系
  for(let i = 0; i < children.length; i++) {
    const child = children[i];
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      dom: null,
      child: null,
      sibling: null
    };

    // fiber.child指向第一个子元素
    if (i==0) {
      fiber.child = newFiber;
    } else {
      // 不是第一个就是兄弟
      preSibling.sibling = newFiber;
    }
    // 保存上一个fiber，下一次循环，让他的兄弟指向基于其他儿子(非第一个儿子）创建的fiber
    preSibling = newFiber;
  }

  // 返回下一个fiber
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while(nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibiling;
    }
    nextFiber = nextFiber.parent;
  }

}


export {
  render
}
