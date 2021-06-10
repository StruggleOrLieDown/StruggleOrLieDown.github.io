# 概述

LinkedList，它的底层基于双向链表实现，在内存中的存储不连续，增、删数据元素时效率极高

这与 ArrayList 本质上不同，对于具体的效率差异，可以运行下述的代码，测试二者在添加数据时的耗费时间

```java
ArrayList<Integer> ArrayList = new ArrayList<>();
long startTime1 = System.currentTimeMillis();
for (int i = 0; i < 100 * 100 * 100; i++) {
	ArrayList.add(i);
}
long endTime1 = System.currentTimeMillis();
System.out.println("ArrayList 用时：" + (endTime1 - startTime1) + " 毫秒");
LinkedList<Integer> LinkedList = new LinkedList<>();
long startTime2 = System.currentTimeMillis();
for (int i = 0; i < 100 * 100 * 100; i++) {
	LinkedList.add(i);
}
long endTime2 = System.currentTimeMillis();
System.out.println("LinkedList 用时：" + (endTime2 - startTime2) + " 毫秒");
```

这正是数据结构的魅力。当然，如果可以了解操作系统中，关于内存存储的细节，那就再好不过了。简单的说，操作系统对于连续、不连续数据的处理问题，只看数据结构，还是会存在些许的疑惑

# 基本使用

底层实现的不同，也使得 LinkedList、ArrayList 中定义的方法爷存在较大的差异

对于 LinkedList，它扩展了如下的方法

- `void addFirst(E e)` ：将指定元素插入到开头位置
- `void addLast(E e)` ：将指定元素插入到结尾位置
- `getFirst()` ：返回列表的第一个元素
- `getLast()` ：返回列表的最后一个元素
- `removeFirst()` ：移除列表的第一个元素，并返回该元素
- `removeLast()` ：移除列表的最后一个元素，并返回该元素
- `E pop()` ：弹出列表的第一个元素
- `void push(E e)` ：添加元素至列表的开头位置
- `boolean isEmpty()` ：判断列表是否为空

```java
LinkedList<String> LinkedList = new LinkedList<>();

// 添加元素至列表的开头、结尾
LinkedList.addFirst("A");
LinkedList.addFirst("B");
LinkedList.addFirst("C");
LinkedList.addLast("D");

// 获取此列表的第一个元素、最后一个元素
System.out.println(LinkedList.getFirst());
System.out.println(LinkedList.getLast());

// 移除该列表的第一个元素、最后一个元素，并返回
System.out.println(LinkedList.removeFirst());
System.out.println(LinkedList.removeLast());
for (String s : LinkedList) {
	System.out.println(s);
}

// 弹出该列表的第一个元素 removeFirst()
System.out.println(LinkedList.pop());

// 添加元素至列表的开头位置 addFirst()
LinkedList.push("E");

// 判断列表是否为空
System.out.println(LinkedList.isEmpty());
```

# 初始化

```java
public LinkedList() {
}
```

这是 LinkedList 的为空扩容，很惊讶。这仅是一个普通的无参构造函数，并不存在其它的操作。也就是说，**LinkedList 不存在初始容量**

底层基于链表实现，数据元素的添加操作，不再像 ArrayList 一样。LinkedList 中，一个元素的添加，仅涉及到至多两个元素的变化，即添加元素的前驱元素、后继元素

![双向链表LinkedList.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/47ddddbc21cb4b5a8c30fab74eb22b0a~tplv-k3u1fbpfcp-watermark.image)

上述图片，是 LinkedList 添加元素时的示意图。可以看出，不需要后面元素的整体后移，仅是修改指针。接下来，关于节点类的讨论，也可以加深理解

# 扩容

扩容这一部分，重点是讨论 LinkedList 对于元素的添加操作，其中的指针是如何变化的

需要先认识几个概念，关于首、尾指针与节点类

- **Node<E> first**：首节点，双向链表的第一个节点
- **Node<E> last**：尾节点，双向链表的最后一个节点

再认识一下节点类 Node，它很重要

```java
private static class Node<E> {
    // 当前元素
    E item;
    // 当前节点的下一节点，即后一个元素
    Node<E> next;
    // 当前元素的上一节点，即前一个元素
    Node<E> prev;

    // 有参构造，生成一个节点类，中间为一个数据元素，两侧为后继、前驱节点（元素）
    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

简单理解为，一个数据元素的添加，可以封装为一个节点类。同时，为它指定上一个、下一个数据元素，以节点类的形式

值得一提的是，首元素只存在后继节点；尾元素只存在前驱节点

理解了这些，接下来就是详细介绍节点类的运用，明白节点类设计的必要性

## 首节点

```java
public void addFirst(E e) {
    linkFirst(e);
}
```

```java
private void linkFirst(E e) {
    // 新建节点类 f，接收当前的首节点
    final Node<E> f = first;
    // 新建节点类，默认将首节点设置为后继节点，原首节点位置设置为 null，即不存在首节点
    final Node<E> newNode = new Node<>(null, e, f);
    // 将新建的节点类 newNode 赋值给全局首节点
    first = newNode;
    // 若不存在首节点
    if (f == null)
        // 则新建的节点类 newNode，既作为首节点，也作为尾节点
        last = newNode;
    else
        // 否则，将原先的首节点，其前驱节点设置为当前新建的节点 newNode
        f.prev = newNode;
    // 记录容器内的节点数
    size++;
    // 记录修改操作的次数
    modCount++;
}
```

看！多么的精妙！

若容器内不存在数据元素，则添加的第一个节点类，同时作为前驱、后继节点；若容器内已存在数据元素（大于 0），即有首节点、尾节点，则将加入的节点类作为首节点，原首节点将前驱设置为当前加入的节点类

## 尾节点

尾节点的概念，与首节点的添加类似，这里也做简单介绍

```java
public void addLast(E e) {
    linkLast(e);
}
```

```java
void linkLast(E e) {
    // 新建节点类 l，接收当前的尾节点
    final Node<E> l = last;
    // 新建节点类 newNode，将之前的尾节点设置为前驱节点，后继节点则为 null
    final Node<E> newNode = new Node<>(l, e, null);
    // 将当前加入的节点，作为尾节点
    last = newNode;
    // 若尾节点为 null，即当前加入的元素，为容器中的第一个元素
    if (l == null)
        // 当前新建的节点类 newNode，也作为首节点存在
        first = newNode;
    else
        // 否则，将之前尾节点的后继节点设置为当前新建的节点类 newNode
        l.next = newNode;
    // 节点类加 1
    size++;
    // 修改操作数加 1
    modCount++;
}
```

与首节点的插入逻辑相似，尾部元素的添加无差异。当然，还是有一个地方需要提一下

```java
public boolean add(E e) {
    linkLast(e);
    return true;
}
```

上述的代码是 LinkedList 正常的元素添加方法，其中，实际调用的是尾部元素添加

## 中间节点

中间节点，其实与首、尾节点类似，具体看下述的代码分析。严格来说，中间节点时根据索引的位置插入节点，也可以被插入在头部、尾部

```java
public void add(int index, E element) {
    // 判断指定的插入的位置，是否存在索引越界的问题
    checkPositionIndex(index);

    // 若指定的位置等于实际节点数，则从尾部添加
    if (index == size)
        // 元素添加至末尾
        linkLast(element);
    else
        // 元素添加至任意位置（非尾部），并取出当前索引的元素节点（已做判空处理）
        // node(index) 是根据索引获取节点类（至关重要）
        linkBefore(element, node(index));
}
```

```java
Node<E> node(int index) {
    // 判断索引是位于链表的上半部分、下半部分，通过位运算
    if (index < (size >> 1)) {
        // 新建节点类 x，并默认为首节点，因为首节点的前驱节点为 null
        Node<E> x = first;
        // 开始遍历索引，确认当前索引代表的节点类
        for (int i = 0; i < index; i++)
            // 请注意：next 后继本身也是一个节点类，也存在对应的 next
            // 不断的索引遍历，获得指定索引处的节点对象
            x = x.next;
        // 返回新建的节点
        return x;
    } else {
        Node<E> x = last;
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
```

```java
void linkBefore(E e, Node<E> succ) {
    // 新建节点类 pred，接收 succ 的前驱节点
    final Node<E> pred = succ.prev;
    // 新建节点类 newNode
    final Node<E> newNode = new Node<>(pred, e, succ);
    // succ 的前驱节点设置为新建节点 newNode
    succ.prev = newNode;
    // pred 接收了 succ 的前驱节点，只有首节点不存在前驱节点
    if (pred == null)
        // 插入的索引位置为 0，将新建节点 newNode 设置为首节点
        first = newNode;
    else
        // 插入的索引不是 0 和尾部，而是中间，将新建节点 newNode 设为 新建节点 pred 的后继节点
        pred.next = newNode;
    size++;
    modCount++;
}
```

中间节点的添加，确实是有些绕，相对于之前的首、尾节点添加。在这里，简要的概括

1. 判断当前的索引是否越界
2. 判断当前的索引是否是尾部索引，添加为尾部节点
3. 获取该索引位置的原节点，并判断当前索引的是否为前置节点
4. 若不是前置节点，则将数据元素插入到中间位置，原节点后移一位

很妙，设计的很妙！比如根据索引获得节点类时，所采用的二分查找。并且，在后半部分中，若索引位置为倒数第二个，则无须遍历。上半部分自前向后；下半部分自后向前

至此，关于 LinkedList 的节点添加，告一段落，算是小有所获

# 小结

LinkedList 中，最重要的就是节点类的概念，其余的方法暂不做介绍，空余时间再填补
