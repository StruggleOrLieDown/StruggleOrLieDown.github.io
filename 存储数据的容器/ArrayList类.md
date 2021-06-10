# 概述

ArrayList 是最为常用的容器类之一，不可不了解

首先，ArrayList 的底层是基于数组实现的，数据在内存中连续存储，在查找数据时效率极高

另外，本次采用的源码分析是基于 JDK11（"11.0.10"），根据个人使用的 JDK 版本。请记住，Java 类的实现根据 JDk 版本的不同而变化

这里，会介绍 ArrayList 的基本使用、容器初始化、容器扩容以及其中对于迭代器的实现

若存在错误、疏漏，万望纠正，不胜感激

# 基本使用

对于 ArrayList 的基本使用，常用的方法如下

- `void add(int index, E element`：插入元素在指定位置
- `boolean add(E e)`：插入元素，在列表的末尾
- `boolean addAll(int index, Collection<? extends E> c)`：插入容器，在指定位置
- `boolean addAll(Collection<? extends E> c)`：插入容器，在列表的末尾
- `void clear()`：清空当前容器
- `boolean contains(Object o)`：是否存在指定元素
- `void forEach (Consumer<? super E> action)`：数据元素的遍历
- `E get(int index)`：取出元素，在指定位置
- `int indexOf(Object o)`：返回某个元素的首次出现位置的索引
- `boolean isEmpty()`：当前容器是否为空
- `iterator<E> iterator()`：返回列表实例的迭代器对象
- `int lastIndexOf(Object o)`：返回某个元素的最后一次出现位置的索引
- `ListIterator<E> listIterator()`：返回列表迭代器
- `ListIterator<E> listIterator(int index)`：返回当前列表部分元素的迭代器
- `E remove(int index)`：删除指定索引的元素
- `boolean remove(Object o)`：删除指定元素

```java
// 右侧实例对象的泛型类型可以不指定
List<String> list = new ArrayList<>();

// 添加元素
list.add("A");
list.add("B");
list.add("C");

// 获取元素
System.out.println(list.get(0));

// 删除元素
System.out.println(list.remove(0));

// 替换元素
list.set(0, "D");

// 清空容器
list.clear();

// 判断容器是否为空
System.out.println(list.isEmpty());

// 判断容器中是否包含指定元素
list.add("E");
System.out.println(list.contains("C"));

// 查找元素的位置
System.out.println(list.indexOf("E"));

// 单例集合转为数组
Object[] objects = list.toArray();
```

以上，是关于 ArrayList 的部分使用，以下，将介绍 ArrayList 的内部实现细节

# 初始化

## 无参初始化

先介绍的是 ArrayList 的为空扩容，即通过无参构造函数进行的扩容，不指定扩容长度、不加入元素

```java
public ArrayList() {
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}
```

**DEFAULTCAPACITY_EMPTY_ELEMENTDATA**：静态不可变的 Object 类型数组，数组为空

**elementData**：Object 类型空数组，负责记录 ArrayList 的数组长度

可以看出，在为空扩容时，ArrayList 的数组容量是 0，而这里存在问题

> Constructs an empty list with an initial capacity of ten：构造一个初始容量为 10 的空列表

这是官方在无参构造初始化方法上，写明的注释，ArrayList 的默认容量是 10，**这必然是官方的失误吧，相信自己的判断**

## 有参初始化

下述，是关于 ArrayList 的有参初始化，传入 int 参数，指定初始化的容量大小

```java
public ArrayList(int initialCapacity) {
    if (initialCapacity > 0) {
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {
        this.elementData = EMPTY_ELEMENTDATA;
    } else {
        throw new IllegalArgumentException("Illegal Capacity: "+
                                            initialCapacity);
    }
}
```

对于指定初始化容量，存在三种情况，较为简单

- `initialCapacity` 作为形式参数，代表在实例化时指定的数组长度
- `EMPTY_ELEMENTDATA` ：静态不可变的 `Object` 空数组
- 若 `initialCapacity` 大于 `0`，则新建对应长度的 `Object` 数组，赋值给 elementData
- 若 `initialCapacity` 等于 `0`，则赋值一个新的 `Object` 空数组 `EMPTY_ELEMENTDATA`，赋值给 elementData
- 若 `initialCapacity` 小于 `0`，则抛出异常 `IllegalArgumentException` 参数接收错误

# 扩容

扩容是很重要的一部分，是 ArrayList 源码分析的核心。对于 ArrayList 的扩容，从添加元素开始

```java
public boolean add(E e) {
    modCount++;
    add(e, elementData, size);
    return true;
}
```

这里，先调用元素添加的方法，传入一个数据元素

**modCount**：int 类型的整数，默认为 0，**负责记录 ArrayList 中修改操作的次数**

这点极为重要，可以有效的检测到并发修改操作的问题。当然，只是发现，不是避免

随后，调用 add(e, elementData, size)，传入三个参数。e 是需要添加的数据元素；elementData 是当前容器的容量；size 理解为 **容器中已使用的容量，即存在的元素个数**

```java
private void add(E e, Object[] elementData, int s) {
    if (s == elementData.length)
        elementData = grow();
    elementData[s] = e;
    size = s + 1;
}
```

在上述方法中，会判断当前实际使用的容量是否达到最大值（不包含当前准备添加的数据元素）

若未达到容量极限，则将数据元素添加至数组的末尾（索引自 0 开始），同时 size 加 1

若已达到容量极限，则调用 grow() 进行 ArrayList 容器的扩容操作。以下是容器扩容的实际操作

```java
private Object[] grow() {
    // 确保扩容之后，可以加入一个元素
    return grow(size + 1);
}
```

```java
private Object[] grow(int minCapacity) {
    // 拷贝已扩容的数组，赋值给 elementData
    return elementData = Arrays.copyOf(elementData,
                                        newCapacity(minCapacity));
}
```

```java
private int newCapacity(int minCapacity) {
    // 新建 oldCapacity，为当前数组的容量
    int oldCapacity = elementData.length;
    // 新建 newCapacity，为当前数组容量的 1.5 倍，使用位运算进行
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    // 判断当前扩容的大小，是否大于旧的容量。若小于等于，执行该分支
    if (newCapacity - minCapacity <= 0) {
        // 判断当前容器容量是否为空，即无参构造初始化下得容器
        if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA)
            // 将当前数组的容器扩容至 10，DEFAULT_CAPACITY = 10
            return Math.max(DEFAULT_CAPACITY, minCapacity);
        // 极为重要！容器得扩容存在极限值，当超出时会存在负数
        if (minCapacity < 0)
            // 堆内存溢出
            throw new OutOfMemoryError();
        return minCapacity;
    }
    // 判断扩容之后的容量是否接近了扩容极限值，MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8
    return (newCapacity - MAX_ARRAY_SIZE <= 0)
        ? newCapacity
        // 若接近了扩容极限，调用 hugeCapacity(minCapacity)
        : hugeCapacity(minCapacity);
}
```

```java
private static int hugeCapacity(int minCapacity) {
    // 判断扩容是否已经超出极限
    if (minCapacity < 0)
        throw new OutOfMemoryError();
    // 此次扩容，为二次扩容，扩容至容量的极限 Integer.MAX_VALUE
    return (minCapacity > MAX_ARRAY_SIZE)
        ? Integer.MAX_VALUE
        : MAX_ARRAY_SIZE;
}
```

上述的代码，介绍了 ArrayList 容器扩容的过程，大致可以归纳为三点

1. 容量全被使用时，新建新的数组，为原数组的 1.5 倍
2. 判断此次扩容的大小，是否接近了容器的扩容极限
3. 若未达到扩容极限，将新数组拷贝给老数组，扩容 1.5 倍
4. 若已接近扩容极限，则二次极限扩容，扩容为 Integer.MAX_VALUE
5. 若已超出扩容极限，抛出异常，此次扩容失败，元素添加失败

有一个彩蛋，ArrayList 在初始添加单个元素时，会 **懒加载，将容器的容量扩容为 10**。这也证明了，官方的注释确实存在一定的歧义、滞后，当以实际的代码为准

# 迭代器实现

在流程控制中，存在 for each 的写法，无须通过索引、下标，即可完成数组元素的遍历。实际上，它是基于迭代器实现的，被迭代的 Java 类必须在内部实现迭代器方法

这里，通过 ArrayList 容器中的迭代器实现，简单介绍迭代器的实现原理

```java
ArrayList<Integer> ArrayList = new ArrayList<>();
ArrayList.add(1);
ArrayList.add(1);
ArrayList.add(1);
Iterator<Integer> iterator = ArrayList.iterator();
while (iterator.hasNext()) {
    System.out.println(iterator.next());
}
```

上述，是迭代器的使用示例，IDE 或许会提示：可以替换为增强 for 循环。这也从旁边佐证了，增强 for 循环的底层实现是基于迭代器

调用的方法是 iterator()，源码也从这里开始分析，只介绍大概的实现与些许细节

```java
public Iterator<E> iterator() {
    return new Itr();
}
```

iterator() 方法，实际上是返回了一个私有的内部类对象 new Itr()

```java
private class Itr implements Iterator<E> {
    // 要返回元素的下一个索引
    int cursor;
    // 需要返回元素的最后一个索引，-1 表示不存在下一个索引
    int lastRet = -1;
    // 记录 ArrayList 的修改操作次数
    int expectedModCount = modCount;

    // prevent creating a synthetic constructor
    Itr() {}

    // 是否存在下一个元素
    public boolean hasNext() {
        // 下一个索引与实际存储的数据元素一致，则不存在下一个元素
        return cursor != size;
    }

    // 获取下一个数据元素
    @SuppressWarnings("unchecked")
    public E next() {
        // 检测是否存在并发修改操作
        checkForComodification();
        int i = cursor;
        // 无数据元素可遍历
        if (i >= size)
            throw new NoSuchElementException();
        Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length)
            // 并发修改异常
            throw new ConcurrentModificationException();
        // 索引往后移一位
        cursor = i + 1;
        // 返回当前索引处的元素，同时修改 lastRet 为当前元素的索引
        return (E) elementData[lastRet = i];
    }

    // 删除数据元素
    public void remove() {
        // 判断当前索引处的数据元素是否已经是最后一个
        if (lastRet < 0)
            throw new IllegalStateException();
        checkForComodification();

        try {
            // 尝试删除元素，调用 ArrayList 中的 remove 方法，删除当前索引的元素
            ArrayList.this.remove(lastRet);
            // 要返回元素的下一个索引，向前进 1
            cursor = lastRet;
            // 修改 lastRet
            lastRet = -1;
            // 同步修改次数，remove 是修改操作
            expectedModCount = modCount;
        } catch (IndexOutOfBoundsException ex) {
            throw new ConcurrentModificationException();
        }
    }

    // 检测迭代器与 ArrayList 的修改次数是否一致
    final void checkForComodification() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
    }
}
```

以上，是对于 ArrayList 中，迭代器实现的简单描述。可以发现，for each 与迭代器的定位极为相似，在迭代器中还存在一个方法 forEachRemaining。具体的不再赘述，有兴趣的自行摸索

多么酣畅淋漓的解读，这就是 ArrayList 中对于迭代器的实现

这里，需要注意迭代器内部的 `remove()` 方法，它会造成不必要的麻烦

- 删除当前索引位置的元素 `ArrayList.this.remove(lastRet);`
- 之后的元素的索引需集体前移一位 `cursor = lastRet;`
- 对于 `remove()`，需要先调用 `next`，否则会造成 `IllegalStateException`

现在，源码又一次解读了疑惑，**2021-04-15 16:14**

若是多个线程同时操作、修改一个 `ArrayList` 容器，或使用迭代器，极易产生异常

所以，ArrayList 迭代器实现，需要 **modCount** 实时记录容器的操作次数，避免并发修改

当然，迭代器本身是非常有用的，对于不存在索引下标的容器，比如遍历 `Set` 集合

值得一提的是，迭代器在元素的操作上，效率是比 `get()` 等方法更高一些，这点了解即可

# 小结

对于容器类的源码阅读，并无想象中的艰难。也很有意思，往后的 LinkedList、HashMap 容器类，还可以加深自己对于数据结构、算法的理解，非常有用

当然，任何源码的阅读必须结合当前的 JDK 版本，它是在不断变换的

不要执着于 JDK8，不存在一套打遍天下的可能，更不要让以前的理解干扰现在的阅读