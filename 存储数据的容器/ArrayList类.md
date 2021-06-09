# 基本使用

`ArrayList` 是常用的容器，基于 **数组实现**，**非线程安全**

`ArrayList`中定义的常用方法

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

# 迭代器实现

在 Java 的容器中，迭代器是一个很重要的概念

简单的理解，迭代是用于遍历容器中的数据元素

```java
public interface Iterable<T> {
	Iterator<T> iterator();
	default void forEach(Consumer<? super T> action) {
		Objects.requireNonNull(action);
		for (T t : this) {
			action.accept(t);
		}
	}
	default Spliterator<T> spliterator() {
		return Spliterators.spliteratorUnknownSize(iterator(), 0);
	}
}
```

上述是迭代器 `Iterable` 的源码，从这可以看出很多东西，其中最醒目的

`default void forEach(Consumer<? super T> action) {}`

迭代器中定义的这个方法，竟是 `forEach`，流程控制的一种

由此可见，`forEach` 是对于 `for i` 的简化，底层是基于迭代器实现的

`ArrayList` 容器也实现了迭代器接口，但 **不是直接实现的，而是通过层层继承**

1. `ArrayList` 继承 `AbstractList`
   - `public class ArrayList<E> extends AbstractList<E> implements List<E>, RandomAccess, Cloneable, java.io.Serializable {}`
1. `AbstractList` 继承 `AbstractCollection`
   - `public abstract class AbstractList<E> extends AbstractCollection<E> implements List<E> {}`

2. `AbstractCollection` 实现 `Collection`
   - `public abstract class AbstractCollection<E> implements Collection<E> {}`

3. `Collection` 继承 `Iterable`
   - `public interface Collection<E> extends Iterable<E> {}`

接下来，是 `ArrayList` 内部对于迭代器的使用，`Iterator()` 方法

```java
public Iterator<E> iterator() {
	return new Itr();
}

// 定义在 ArrayList 内部的成员内部类
private class Itr implements Iterator<E> {
	// 返回下一个元素的索引位置
	int cursor;
	// 返回下一个元素的索引位置，若不存在，则为 -1
	int lastRet = -1;
	// 实时记录容器元素的操作次数，避免并发修改
	int expectedModCount = modCount;

	// 是否存在下一个数据元素
	public boolean hasNext() {}
	// 获取下一个数据元素
	public E next() {}
	// 移除最后一个获取的数据元素
	public void remove() {}
}
```

接下来，通过 ArrayList 中的实现，**了解迭代器的工作原理**

```java
// 第一步：判断是否存在下一个元素
public boolean hasNext() {
	// cursor：下一个数据元素的索引位置
	// size：记录 ArrayList 实际存在的数据元素个数
	// 原理：若 cursor、size 不相等，则存在下一个数据元素
	return cursor != size;
}

// 第二步：获取下一个元素
public E next() {
	// 判断当前的容器是否正在被其它线程操作、修改，保证 modCount 的一致性
	checkForComodification();
	int i = cursor;
	if (i >= size)
		throw new NoSuchElementException();
	Object[] elementData = ArrayList.this.elementData;
	if (i >= elementData.length)
		throw new ConcurrentModificationException();
	// 更新下一个元素的索引位置
	cursor = i + 1;
	// lastRet 返回当前元素索引，course 初始值 为 0，i 为 0
	return (E) elementData[lastRet = i];
}
final void checkForComodification() {
	// modCount：记录 ArrayList 中修改操作的次数
	// expectedModCount：实时保存 modCount
	if (modCount != expectedModCount)
		throw new ConcurrentModificationException();
}

// 第三步：删除最后一个获取的元素
public void remove() {
	// lastRet：实时记录最后一个元素的索引位置，-1 不存在元素
	if (lastRet < 0)
		throw new IllegalStateException();
	checkForComodification();

	try {
		ArrayList.this.remove(lastRet);
		// cursor：记录下一个元素的索引
		// lastRet：记录已获取元素中的，最后一个元素的索引
		cursor = lastRet;
		// cursor = lastRet，则不存在下一个元素，lastRet 赋值为 - 1
		lastRet = -1;
		expectedModCount = modCount;
	} catch (IndexOutOfBoundsException ex) {
		throw new ConcurrentModificationException();
	}
}
```

多么酣畅淋漓的解读，这就是 ArrayList 中对于迭代器的实现

这里，需要注意迭代器内部的 `remove()`

- 删除当前索引位置的元素 `ArrayList.this.remove(lastRet);`
- 之后的元素的索引需集体前移一位 `cursor = lastRet;`
- 对于 `remove()`，需要先调用 `next`，否则会造成 `IllegalStateException`

现在，源码又一次解读了疑惑，**2021-04-15 16:14**

基于 `ArrayList` 的迭代器实现，可以发现，线程不安全的特点

若是多个线程同时操作、修改一个 `ArrayList` 容器，或使用迭代器，极易产生异常

所以，ArrayList 迭代器实现，需要 **modCount** 实时记录容器的操作次数，避免并发修改

当然，迭代器本身是非常有用的，对于不存在索引下标的容器，比如遍历 `Set` 集合

值得一提的是，迭代器在元素的操作上，效率是比 `get()` 等方法更高一些的

# 初始化

`ArrayList 无参构造 `：初始化时，数组默认为空

```java
public ArrayList() {
	this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}
```

- `elementData` ：元素数据，定义为 `Object` 类型的数组，初始为 `Null`
- `DEFAULTCAPACITY_EMPTY_ELEMENTDATA` ：静态不可变的 `Object` 空数组

`ArrayList 有参构造 `：初始化时，可以指定数组的长度

```java
public ArrayList(int initialCapacity) {
	if (initialCapacity> 0) {
		this.elementData = new Object[initialCapacity];
	} else if (initialCapacity == 0) {
		this.elementData = EMPTY_ELEMENTDATA;
	} else {
		throw new IllegalArgumentException("Illegal Capacity:"+ initialCapacity);
	}
}
```

- `initialCapacity` 作为形式参数，代表在实例化时指定的数组长度
- `EMPTY_ELEMENTDATA` ：静态不可变的 `Object` 空数组
- 若 `initialCapacity` 大于 `0`，则新建对应长度的 `Object` 数组
- 若 `initialCapacity` 等于 `0`，则赋值一个新的 `Object` 空数组 `EMPTY_ELEMENTDATA`
- 若 `initialCapacity` 小于 `0`，则抛出异常 `IllegalArgumentException` **参数接收错误**

# 扩容

`ArrayList 元素添加 `：ArrayList 扩容的开始

```java
// 第一步 添加元素
public boolean add(E e) {
	// 记录容器内部的修改次数
	modCount++;
	// 实际调用的添加方法
	add(e, elementData, size);
	return true;
}

// 第二步 判断数组长度
private void add(E e, Object[] elementData, int s) {
	// elementData：当前数组的长度，此时传入的元素不计算在内
	if (s == elementData.length)
		// 当前数组已满，开始扩容，调用 grow()
		elementData = grow();
	elementData[s] = e;
	// size：当前数组中实际存储的元素个数
	size = s + 1;
}

private Object[] grow() {
	return grow(size + 1);
}

private Object[] grow(int minCapacity) {
	// 将扩容的新数组拷贝给 elementData 数组
	return elementData = Arrays.copyOf(elementData, newCapacity(minCapacity));
}

// 第三步 创建新的数组对象
private int newCapacity(int minCapacity) {
	int oldCapacity = elementData.length;
	// 新数组扩容为老数组的 1.5 倍
	int newCapacity = oldCapacity + (oldCapacity>> 1);
	// 判断扩容 1.5 倍之后的新数组，是否足够存储添加的元素
	if (newCapacity - minCapacity <= 0) {
		if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA)
			return Math.max(DEFAULT_CAPACITY, minCapacity);
		if (minCapacity < 0)
			throw new OutOfMemoryError();
		return minCapacity;
	}
	// 若新数组依旧无法存储所有的数据元素，则调用 hugeCapacity(int minCapacity)
	return (newCapacity - MAX_ARRAY_SIZE <= 0)
		? newCapacity
		: hugeCapacity(minCapacity);
}

// 第四步：初次扩容 1.5 倍不足，再次扩容，此次扩容为极限扩容
private static int hugeCapacity(int minCapacity) {
	if (minCapacity < 0)
		throw new OutOfMemoryError();
	// MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8; int 最大取值减 8
	return (minCapacity> MAX_ARRAY_SIZE)
		? Integer.MAX_VALUE
		: MAX_ARRAY_SIZE;
}
```

以上是对 ArrayList 源码的分析，当前版本为 `JDK11.0.10`

可以看出一些有意思的地方

- 初始化时，存储数组作为空数组存在，这与主流的 JDK8 是不同的
- **当第一次添加元素时，默认分配的数组长度为 10**
- 在一次扩容操作中，最多仅作两次新数组的创建，二次扩容至极限
- 从数组的二次扩容 `hugeCapacity(int minCapacity)` 中，可以看出，最大扩容为 int 的最大取值

对于 ArrayList 首次添加元素时，也会扩容，注意此前的方法 `private int newCapacity(int minCapacity)`

若对新的 ArrayList 容器添加多个元素

```java
// 判断新数组是否小于老数组
if (newCapacity - minCapacity <= 0) {
	// 首次添加元素时，老数组实际未扩容，与默认数组长度一致
	if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA)
		// 重点，若首次添加元素个数小于 10，则默认分为新数组长度为 10
		// Math.max()：返回两个数值中的最大值
		return Math.max(DEFAULT_CAPACITY, minCapacity);
	if (minCapacity < 0)
		throw new OutOfMemoryError();
	return minCapacity;
}
```

`private static final int DEFAULT_CAPACITY = 10;`：默认扩容大小

**对于源码的阅读，一定要根据 JDK 版本的不同而加以区分**

以 ArrayList 为例，在之前版本，初始化时，即默认数组长度为 10

而在 JDK11 中，初始化为空数组，实际添加元素后，才会可能默认分配数组长度为 10

源码的阅读是非常有帮助的，就好比可能存在的一个疑问

**ArrayList 内部是 Object() 数组，那为何可以限制传入的数据元素类型**

`public class ArrayList<E> ....{}`

`public boolean add(E e) {}`

**并且，以 Object 类型的数组进行存储，取出时不是 Object 类型**

```java
public E get(int index) {
	Objects.checkIndex(index, size);
	// 返回对应位置的数据元素，调用 elementData(int index)
	return elementData(index);
}
```

```java
E elementData(int index) {
	// 返回存储数组中的对应元素，并进行类型转换
	return (E) elementData[index];
}
```

只需要打开源码，大多数的问题都可以迎刃而解

不要畏惧未知，骚年

**击溃你的，不是困难本身，而畏惧困难时的迷茫**
