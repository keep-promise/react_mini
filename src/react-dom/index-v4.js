// Step IV: Fibers
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

// 1.add the element to the DOM
// 2.create the fibers for the element’s children
// 3.select the next unit of work


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

function render(element, container) {
  // 初始化第一个fiber，第一个任务
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element]
    },
    child: null,
    parent: null,
    sibling: null
  }
}

// 调度渲染实现
let nextUnitOfWork = null; // 下一次渲染的节点
1+1
// 调度函数
function workLoop(deadLine) {
  let shouldYield = false; // 是否中断
  // 有工作且不应该中断
  while(!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 做工作：当前fiber节点生成真实dom，【并追加到parent父节点的dom上】[后面会抽离出去]，
    // 构建孩子节点的fiber树, 然后返回下一个任务fiber，有孩子返回孩子，没孩子返回父亲的兄弟
    shouldYield = deadLine.timeRemaining() < 1; // 剩余时间小于1ms，要中断
  }
  // 没有足够的时间，请求下一次浏览器空闲时间调度
  requestIdleCallback(workLoop);
}

// 第一次浏览器空闲时间调度
requestIdleCallback(workLoop);

// 渲染节点，并返回下一个需要渲染的节点
function performUnitOfWork(fiber) {
  // add dom node
  // 创建dom元素
  if(!fiber.dom) {
    fiber.dom = createDOM(fiber);
  }

  // 追加父节点
  if(fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // create new fibers
  // children创建fiber
  const children = fiber.props.children;
  let preSibling = null;

  // 构建fiber tree，并建立联系
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

  // return next unit of work
  // 返回下一个fiber
  if (fiber.child) {
    return fiber.child;
  }
  // 如果没儿子，就找兄弟，如果也没有兄弟，就往上查找父亲的兄弟
  let nextFiber = fiber;
  while(nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}


export {
  render
}