// fiber解决同步渲染的问题，优化成异步渲染，链表【parent、child、sibling】
// 每一个element都是一个节点，转成链表结构
// 结构：树 -》平铺结构
// 异步渲染：类似 requestIdleCallback -- render阶段，构建fiber【虚拟dom】
// 同步 --- commit阶段，把虚拟dom转成真实dom追加到页面上

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
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    sibiling: null, 
    child: null,
    parent: null
  };
  nextUnitOfWork = wipRoot;
}

// 调度渲染实现
let nextUnitOfWork = null; // 下一次渲染的节点
let wipRoot = null; // 根节点

// commit阶段 -- 这一个过程同步执行，不可中断
function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const parentDOM = fiber.parent.dom;
  parentDOM.append(fiber.dom);
  // 深度遍历渲染子节点dom，然后再渲染兄弟节点
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// 调度函数
function workLoop(deadLine) {
  let shouldYield = false; // 是否中断
  // 有工作且不应该中断
  while(!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork); // 做工作
    // 做工作：当前fiber节点生成真实dom，构建孩子节点的fiber树, 
    // 然后返回下一个任务fiber，有孩子返回孩子，没孩子返回父亲的兄弟
    shouldYield = deadLine.timeRemaining() < 1; // 剩余时间小于1ms，要中断
  }
  // 没有足够的时间，请求下一次浏览器空闲时间调度
  requestIdleCallback(workLoop); // 异步

  // 没有fiber要render，且wipRoot存在，就执行commit阶段
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }
}

// 第一次浏览器空闲时间调度
requestIdleCallback(workLoop);

// 渲染fiber节点，并返回下一个需要渲染的fiber节点
function performUnitOfWork(fiber) {
  // 创建dom元素
  if(!fiber.dom) {
    fiber.dom = createDOM(fiber);
  }


  // 追加父节点 -- render阶段不要追加dom，render阶段和commit阶段分离
  // 原因：[commit阶段]挂载到dom上，requestIdleCallback中断performUnitOfWork工作，
  // 挂载部分dom时中断，出现部分数据更新，部分数据未更新
  // 用户看到不完整，因此将挂载dom抽离到 [commit阶段]，同步挂载
  // if(fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

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
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return nextFiber;
}

export {
  render
}
