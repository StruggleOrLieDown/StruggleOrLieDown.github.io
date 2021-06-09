# IOC 简述

控制反转（英语： Inversion of Control，缩写为 IoC ），是面向对象编程中的一种设计原则，可以用来减低计算机代码之间的耦合度。其中最常见的方式叫做依赖注入（Dependency Injection，简称 DI），还有一种方式叫 “依赖查找”（Dependency Lookup）

早在 2004 年，Martin Fowler 就提出了 “哪些方面的控制被反转了？” 这个问题。他总结出是依赖对象的获得被反转了，因为大多数应用程序都是由两个或是更多的类通过彼此的合作来实现业务逻辑，这使得每个对象都需要获取与其合作的对象（也就是它所依赖的对象）的引用。如果这个获取过程要靠自身实现，那么这将导致代码高度 耦合并且难以维护和调试。

Class A 中用到了 Class B 的对象 b，一般情况下，需要在 A 的代码中显式的 new 一个 B 的对象。

采用依赖注入技术之后，A 的代码只需要定义一个私有的 B 对象，不需要直接 new 来获得这个对象，而是通过相关的容器控制程序来将 B 对象在外部 new 出来并注入到 A 类里的引用中。而具体获取的方法、对象被获取时的状态由配置文件（如 XML）来指定。

实现控制反转主要有两种方式：依赖注入和依赖查找。两者的区别在于，前者是被动的接收对象，在类 A 的实例创建过程中即创建了依赖的 B 对象，通过类型或名称来判断将不同的对象注入到不同的属性中，而后者是主动索取相应类型的对象，获得依赖对象的时间也可以在代码中自由控制。

依赖注入有如下实现方式：

基于接口。实现特定接口以供外部容器注入所依赖类型的对象。
基于 set 方法。实现特定属性的 public set 方法，来让外部容器调用传入所依赖类型的对象。
基于构造函数。实现特定参数的构造函数，在新建对象时传入所依赖类型的对象。
基于注解。基于 Java 的注解功能，在私有变量前加 “@Autowired” 等注解，不需要显式的定义以上三种代码，便可以让外部容器传入对应的对象。该方案相当于定义了 public 的 set 方法，但是因为没有真正的 set 方法，从而不会为了实现依赖注入导致暴露了不该暴露的接口（因为 set 方法只想让容器访问来注入而并不希望其他依赖此类的对象访问）。

依赖查找更加主动，在需要的时候通过调用框架提供的方法来获取对象，获取时需要提供相关的配置文件路径、key 等信息来确定获取对象的状态

**上述介绍引用自维基百科，对于 IOC 的描述极为清晰！**

# 入门示例

第一步：先构建一个标准的 Maven 项目，导入 Spring 的核心依赖

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>5.2.15.RELEASE</version>
</dependency>
```

为了方便测试，也可以选择再导入 junit 依赖

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>
```

第二步：创建 Java 的实体类 Person，之后该 Java 类的对象实例化交由 Spring 管理

```java
public class Person {
    private String name;
    private Short age;

    public void setName(String name) {
        this.name = name;
    }

    public void setAge(Short age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}
```

第三步：在新建的 Maven 项目的资源目录下，新建 Spring 的配置文件 SpringBeans.xml，并将之前的 Person 类注入为 Bean 对象

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="person" class="com.xxx.entity.Person">

    </bean>

</beans>
```

第四步：编写测试代码

```java
@Test
public void get() {
    ApplicationContext context = new ClassPathXmlApplicationContext("SpringBeans.xml");
    Person person = (Person) context.getBean("person");
    person.setName("里斯");
    person.setAge((short) 16);
    System.out.println(person);
}
```

至此，可以看到 Spring 中 IOC 的作用：**接管类的对象实例化，统一配置**

这里，简单介绍下之前的几个步骤

1. SpringBeans.xml 是 IOC 容器工厂，其中负责配置需要实例化的类对象，通过 XML 的形式
2. bean 对象存在的两个属性，class 是类的全限定名，id 是 bean 对象的唯一标识，多为类名首字母小写
3. ClassPathXmlApplicationContext 是通过相对路径读取 Spring 的配置文件位置，根目录为 Maven 的资源目录

# 模拟 IOC 容器

IOC 是如何接管对象实例化的？其实很简单，在之前的反射机制中，存在 **通过类的全限定名，完成对象的实例化创建**

现在，简单的模拟一个 IOC 容器的实现，大致思路如下

1. 新建配置文件，进行 XML 解析，获取 id、class 属性
2. 对于获得的 class 属性，通过反射机制实例化对象
3. 通过 id，再获取对应的实例化对象，调用相关方法

第一步：导入相关的 Maven 依赖，无须 Spring 依赖

```xml
<!-- 解析 XML 配置文件 -->
<dependency>
    <groupId>dom4j</groupId>
    <artifactId>dom4j</artifactId>
    <version>1.1</version>
</dependency>
<dependency>
    <groupId>jaxen</groupId>
    <artifactId>jaxen</artifactId>
    <version>1.2.0</version>
</dependency>
<!-- 测试依赖 -->
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>
```

第二步：编写相关的配置文件 SpringBeans.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<beans>
    <bean id="person" class="com.xxx.Person"></bean>
</beans>
```

第三步：新建实体类、Bean 类

```java
public class Person {
    private String name;
    private Short age;

    public void setName(String name) {
        this.name = name;
    }

    public void setAge(Short age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}
```

```java
public class Bean {
    /** bean 对象的 id */
    private String id;
    /** bean 对象的 class，写做 clazz，避免关键字的使用  */
    private String clazz;

    public Bean() {
    }

    public Bean(String id, String clazz) {
        this.id = id;
        this.clazz = clazz;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getClazz() {
        return clazz;
    }

    public void setClazz(String clazz) {
        this.clazz = clazz;
    }
}
```

第四步：编写读取配置文件的 Java 类 ClassPathXmlApplicationContext

```java
public class ClassPathXmlApplicationContext {
    private List<Bean> bean;
    private Map<String, Object> beans = new HashMap<>();

    /**
     * 读取配置文件
     */
    public ClassPathXmlApplicationContext(String fileName) {
        /* 解析配置文件，获取其中定义的 Bean 对象，存入 List */
        this.parseXml(fileName);
        /* 通过反射，完成对象的实例化，存入 Map */
        this.instanceBean();
    }

    public Object getBean(String id) {
        return beans.get(id);
    }

    /**
     * 获取之前的 Bean 对象列表，实例化其中的类
     */
    private void instanceBean() {
        if (bean != null && bean.size() > 0) {
            for (Bean bean : bean) {
                String id = bean.getId();
                String clazz = bean.getClazz();
                try {
                    /* 反射完成对象的实例化 */
                    Object o = Class.forName(clazz).newInstance();
                    /* 以 id、实例对象的形式存储 */
                    beans.put(id, o);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private void parseXml(String fileName) {
        /* 获取 XML 解析器 */
        SAXReader saxReader = new SAXReader();
        /* 获取配置文件的路径 */
        URL resource = this.getClass().getClassLoader().getResource(fileName);
        try {
            /* 解析配置文件 */
            Document read = saxReader.read(resource);
            /* 解析 XML 标签 */
            XPath xPath = read.createXPath("beans/bean");
            List<Element> nodes = xPath.selectNodes(read);
            if (nodes != null && nodes.size() > 0) {
                /* 需要时，完成实例化 */
                bean = new ArrayList<>();
                for (Element el : nodes) {
                    /* 获取标签的属性值 */
                    String id = el.attributeValue("id");
                    String aClass = el.attributeValue("class");
                    /* 存入 Bean 对象 */
                    Bean beans = new Bean(id, aClass);
                    /* 存入容器 */
                    bean.add(beans);
                }
            }
        } catch (DocumentException e) {
            e.printStackTrace();
        }
    }
}
```

这一步较为复杂，其中如何解析 XML 文件暂不介绍。可以看出，**获取 Java 类的 class 属性，即全限定名，反射创建实例对象**

第五步：测试该 IOC 容器的模拟实现、

```java
@Test
public void get(){
    ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("SpringBeans.xml");
    Person person = (Person) context.getBean("person");
    person.setName("里斯");
    person.setAge((short) 12);
    System.out.println(person);
}
```

至此，对于 IOC 容器的模拟实现有了一定的认识，尽管看起来极为粗糙。却已经实现了类的实例化，不再通过关键字 new，完成 **对象控制权的反转**

# 配置文件加载

在之前，通过 ClassPathXmlApplicationContext 基于相对路径加载配置文件。在 Spring 中，提供了其它的加载文件的方式

ApplicationContext 接口作为配置文件加载类的父接口存在。其下定义了两种主要的实现类

1. ClassPathXmlApplicationContext：相对路径加载，例如Maven项目的资源目录
2. FileSystemXmlApplicationContext：绝对路径加载，文件在当前计算机中的全路径

另外，当需要同时加载多个配置文件时，也存在两种方式

```java
// 第一种：传入多个参数即可
ApplicationContext context = new ClassPathXmlApplicationContext("services.xml", "daos.xml");
```

```xml
<!-- 第二种：导入其它的配置文件到总配置文件中，通过标签 import -->
<beans>
    <import resource="services.xml"/>
    <import resource="resources/messageSource.xml"/>
    <import resource="/resources/themeSource.xml"/>

    <bean id="bean1" class="..."/>
    <bean id="bean2" class="..."/>
</beans>
```

<!-- # Bean 对象实例化

对于Bean对象的实例化，Spring中提供了三种方式

1. 无参构造实例化（默认使用）
2. 静态工厂实例化
3. 实例工厂实例化 -->

# Bean 实例化

Spring IoC 容器通过 Bean 对象，可以完成 Java 类的实例化操作，存在三种实例化方式

1. 无参构造实例化
2. 静态工厂实例化
3. 实例工厂实例化

bean 对象默认使用无参构造进行实例化，不做介绍

## 静态工厂方法实例化

工厂设计模式的使用

第一步：新建对应的静态工厂类

```java
public class StaticFactory {
    private static Person person = new Person();

    public StaticFactory() {
    }

    public static Person createPerson() {
        return person;
    }
}
```

第二步：新建对应的 bean 对象

```xml
<bean id="staticFactory" class="com.entity.StaticFactory" factory-method="createPerson">
</bean>
```

第三步：新建测试方法

```java
@Test
public void get02() {
	BeanFactory beanFactory = new ClassPathXmlApplicationContext("beans.xml");
	Object staticFactory = beanFactory.getBean("staticFactory");
	System.out.println(staticFactory);
}
```

对于静态工厂实例化，很好理解。在静态工厂类中新建私有静态成员属性，该属性为对应的 Java 类，同时新建相应的静态方法，以返回新建的静态属性，即 Java 类的实例对象

在 bean 对象中，需要将 class 属性更换为静态工厂类的全限定名。并且添加 factory-method 属性，属性值为静态工厂类中的对应静态方法

## 实例工厂方法实例化

实例工厂方法相对复杂

第一步：取消之前的静态工厂类的静态方法，变更为实例方法

```java
public Person createPerson() {
	return person;
}
```

第二步：新建实例工厂类

```java
public class InstanceFactory {
    private StaticFactory staticFactory = new StaticFactory();

    public InstanceFactory() {
    }

    public StaticFactory createStaticFactory() {
        return staticFactory;
    }
}

```

第三步：新建实例工厂类的 bean 对象，并修改之前的静态工厂类的 bean 对象

```xml
<bean id="staticFactory" class="com.entity.StaticFactory">
</bean>
<bean id="instanceFactory" factory-bean="staticFactory" factory-method="createPerson">
</bean>
```

第四步：编写测试代码

```java
@Test
public void get03() {
	BeanFactory beanFactory = new ClassPathXmlApplicationContext("beans.xml");
	Object staticFactory = beanFactory.getBean("instanceFactory");
	System.out.println(staticFactory);
}
```

实例工厂实例化，是通过托管静态工厂中的非静态方法实现的，细节请参考 Spring 官方文档

## 小结

上述，介绍了除无参构造实例化以外的两种工厂实例化方法。一个工厂类中可以存在多个工厂方法，分别对应独立的 bean 对象，但相对而言，工厂实例化使用的场景并不是很多。

# DI 依赖注入

DI 依赖注入，就是为 bean 对象注入属性值，一个 Java 类的实例对象属性赋值被称为 DI 依赖注入

对于依赖注入的方式吗，存在两种

1. 通过 set 方法注入属性
2. 通过有参构造注入属性

在以前的开发中，也是通过以上的两种方式完成实例对象的属性注入，这里，只是交由 IoC 容器管理

## set 注入

set 注入，必须使 Java 类存在对应的 set 方法

第一步：新建 Java 类，生成 set 方法

```java
public class Person {
    private String name;
    private Integer age;

	......

    public void setName(String name) {
        this.name = name;
    }

    public void setAge(Integer age) {
        this.age = age;
    }
	......
}
```

第二步：通过 bean 对象完成 DI 属性注入

```xml
<bean id="person" class="com.entity.Person">
	<property name="name" value="里斯"/>
	<property name="age" value="2000"/>
</bean>
```

第三步：新建测试方法

```java
@Test
public void get() {
	BeanFactory beanFactory = new ClassPathXmlApplicationContext("beans.xml");
	Object person = beanFactory.getBean("person");
	System.out.println(person);
}
```

此时，可以发现，bean 对象中存在属性，不再为 null


## 构造注入

构造注入，指的是有参构造，需要注意其中的形式参数

对于构造注入，XML 标签由 property 变为了 constructor-arg，其余大致相同

```xml
<bean id="person" class="com.entity.Person">
	<constructor-arg name="name" value="里斯"/>
	<constructor-arg name="age" value="2000"/>
</bean>
```

## 小结

对于 DI 依赖注入，在官方文档还有更多的细节介绍

1. set 注入时，根据属性的类型，如 list、map，存在不同的写法
2. 构造注入时，可以将注入的属性与形参建立联系，通过形参的索引位置
3. 可以将 value 属性更换为 ref 属性，表示引用其它的 bean 对象，对应的是 Java 类的引用类型属性

这里，不做这些过于细节的介绍，大多数很少使用，例如构造的索引匹配

**对于 set、有参构造的注入方式，存在着各自的弊病，这里先留作日后介绍**

# 自动化装配

在之前的 DI 依赖注入中，需要手动完成，这样过于繁琐，Spring 中支持通过注解的形式完成自动化装配

## 注解配置

对于 Spring 中的注解支持，需要做如下的配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd">

    <context:annotation-config/>

</beans>
```

上述是摘自 Spring 官方文档中的配置说明

1. 添加相应的命名空间 xmlns:context...
2. 开启注解 <context:annotation-config/>

必须这样，Spring 中才可以支持注解的使用，而自动化装配就是通过注解形式实现的

## @Autowired

对于注解，应该是较为熟悉，例如注解的可应用位置等

@Autowired 注解，应用的场景较多，这里应用于字段属性。接下来，介绍注解对于自动化装配的实现

第一步：新建 School 类，作为 Person 类的引用属性存在

```java
public class School {
}
```

第二步：对 Person 类做如下修改，使用 @Autowired 注解，并通过 get 方法获取 school 对象

```java
public class Person {
    @Autowired
    private School school;

    public School getSchool() {
        return school;
    }
}
```

第三步：新建对应的 bean 对象

```xml
<bean id="school" class="com.entity.School"/>
<bean id="person" class="com.entity.Person"/>
```

第四步：新建测试方法，注意类型的强制转换，以使用 get 方法

```java
@Test
public void get() {
	BeanFactory beanFactory = new ClassPathXmlApplicationContext("beans.xml");
	Person person = (Person) beanFactory.getBean("person");
	System.out.println(person.getSchool());
}
```

至此，通过 @Autowired 注解实现了对象的自动装配。注意，是对象的自动装配，对应 bean 对象依旧是手动创建

若是取消 @Autowired 注解，再运行测试程序，则 school 对象的引用为 null

```java
public class Person {
    // @Autowired
    private School school;

    public School getSchool() {
        return school;
    }

    public void setSchool(School school) {
        this.school = school;
    }
}
```

```xml
<bean id="school" class="com.entity.School"/>
<bean id="person" class="com.entity.Person">
	<property name="school" ref="school"/>
</bean>
```

上述是不使用 @Autowired 注解进行自动化装配，所需要进行的步骤。可以看出，@Autowired 实际是省略了 set、有参注入与 bean 对象的引用

**@Qualifier 注解可以指定注入的接口类的具体某一个实现类**

## @Resource

对于 @Resource 注解，是由 JDK 提供，并非 Spring 自带，若无法正常引入，则导入如下依赖

**若是依旧失败，请清空 Maven 依赖，再次下载，个人的经验之谈**

```xml
<dependency>
	<groupId>javax.annotation</groupId>
	<artifactId>javax.annotation-api</artifactId>
	<version>1.3.1</version>
</dependency>
```

在使用上，@Resource注解与@Autowired注解类似，但请仔细观察下方示例

```xml
<bean id="sc1111hool" class="com.entity.School"/>
<bean id="person" class="com.entity.Person"/>
```

```java
public class Person {
    @Resource
    private School school;

    public School getSchool() {
        return school;
    }

    public void setSchool(School school) {
        this.school = school;
    }
}
```

运行测试方法，竟然可以正确的输出，但 bean 的 id 是错误的。此时，将自动装配注解切换回 @Autowired，会发现控制台报错！

## 小结

对于 @Resource 注解，最大的不同是，它会再根据类型匹配，即 byType。而对于 @Autowired，若是无法匹配到对应 bean 的 id，则直接匹配失败，属于 byName

通俗些说，@Autowired 自动注入是基于 bean 对象的 id 值；@Resource 也是基于 id 值，但会在匹配失败后根据 class 属性值再次匹配

# 扫描器

在之前，完成了 bean 对象的自动装配，但仍然需要手动在 IoC 容器中创建 bean 对象

Spring 中存在扫描器的概念，可以将某一部分 Java 设为 bean 对象，进行管理

在 beans.xml 中开启扫描器配置，示例如下，将 com 以及子包中的 Java 类设为 bean 对象

```xml
<context:component-scan base-package="com"/>
```

**对于 Spring 的配置，其中的命名空间、设置开启等，请参考 Spring 文档中对于这些部分做的说明**

此时，对于beans.xml中定义的bean对象，已经没有存在的必要，而自动装配依旧可以完成，示例如下

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd">
    <context:annotation-config/>
    <context:component-scan base-package="com"/>
</beans>
```

```java
@Component
public class School {
}
```

```java
@Component
public class Person {

    @Resource
    private School school;

    public School getSchool() {
        return school;
    }
}
```

```java
@Test
public void get() {
    BeanFactory beanFactory = new ClassPathXmlApplicationContext("beans.xml");
    Person person = (Person) beanFactory.getBean("person");
    System.out.println(person.getSchool());
}
```

可以看到，在 beans.xml 中开启 beans 扫描器以后，需要在管理的 Java 类上添加注解 @Component

Java 的开发遵循 MVC 三层设计，存在 Controller、Service、Dao 三个层。Spring 为这三个层提供了对应的注解 @Controller、@Service、@Repository，其余不属于这三层的统一使用 @Component 注解

也就是说，在 beans.xml 中开启扫描器，依旧需要在对应的 Java 类上配置注解

**Java 类配置注解为 bean 对象，bean 对象的 id 默认为类名首字母小写**

可以指定 bean 对象的别名，通过 @Component 等注解，这不影响扫描器赋予的默认 id

当然，对于 Java 程序的开发，还请务必遵循规范进行

# 注解开发

在 Spring 中，已经可以实现纯注解的形式进行开发，无须再配置 beans.xml

在 Spring 中，常用的注解大致如下

| 注解 | 位置 | 作用 |
|:-|:-|:-|
|@Configuration | 类 | 应用程序配置，取代 beans.xml|
|@Bean | 方法 | 返回单例 Bean，用于组件集成 |
|@ComponentScan | 类 | 扫描器的注解配置 |
|@Value | 字段 | 为成员属性赋值 |
|@Component、@Controller、@Service、@Repository | 类 | 将 Java 类声明为 bean 对象 |
|@Resource、@Autowired | 字段、set 方法、构造方法 | bean 对象的自动化装配 |
|@PropertySource | 类 | 加载外部 property 配置文件 |

以下，通过实际的案例，对上述的部分注解做运用，理解 Spring 的纯注解开发方式，注意其中的细节！

第一步：创建应用程序配置的Java类

```java
@Configuration
@ComponentScan(basePackages = "com.config")
@PropertySource(value = {"classpath:jdbc.properties"})
public class SpringBeans {
    @Bean
    public DataSource getDataSource() {
        return new DataSource();
    }
}
```

第二步：新建外部的properties属性配置文件

```properties
jdbc.driver=com.mysql.cj.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/rent?serverTimezone=Asia/Shanghai
jdbc.username=root
jdbc.password=123456
```

第三步：新建DataSource类

```java
@Component
public class DataSource {
    @Value("${jdbc.driver}")
    private String driver;
    @Value("${jdbc.url}")
    private String url;
    @Value("${jdbc.username}")
    private String root;
    @Value("${jdbc.password}")
    private String password;

    @Override
    public String toString() {
        return "DataSource{" +
                "driver='" + driver + '\'' +
                ", url='" + url + '\'' +
                ", root='" + root + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
```

第四步：编写测试代码

```java
@Test
public void get() {
    ApplicationContext beanFactory = new AnnotationConfigApplicationContext(SpringBeans.class);
    DataSource dataSource = (DataSource) beanFactory.getBean("dataSource");
    System.out.println(dataSource);
}
```

上述的四个步骤，简单的演示了基于纯注解的 Spring 配置

其中，对于之前介绍的部分 Spring 注解有了应用，例如 @ComponentScan(basePackages = "com.config")，取代了 XML 中定义的扫描器。另外，获取应用程序的 class 文件必须使用 AnnotationConfigApplicationContext 实现类，不再是读取 XML 配置

当然，纯注解开发的方法固然简便，却不是主流，依旧是以稳重的 XML 为重。纯粹的 Spring 注解开发，需要以 SpringBoot 实现，在原生的 Spring 开发中，配置文件极为繁琐，XML 优于纯注解

# 作用域

Spring 中管理的 bean 对象存在作用域，分为两类

| 作用域 | 定义 |
|:-|:-|
|singleton | 单例作用域，一个 bean 对象在程序运行时只存在一个 bean 实例 |
|prototype | 一个 bean 对象可以存在多个 bean 实例 |

默认不声明的情况下，bean 对象为单例作用域

| 作用域 | 定义 |
|:-|:-|
|request | 一次 http 的 request 请求 |
|session | 一次 htpp 的 session 会话 |
|application | 一次 spring 程序的运行，相当于 ServletContext|
|websocket | 单个 websocket 的连接 |

Spring 中，bean 的作用域，还存在四种，只可以应用于 WEB 环境中

对于作用域的声明，是 bean 对象的 scope 属性，注解则为 @Scope(value = "XXX")

# 延迟加载

在 Spring 中的 bean 对象，默认在容器加载时，可以选择是否延迟初始化，默认 bean 对象在容器启动时初始化

```java
@Component
@Lazy(value = true)
public class PersonA {
    public PersonA() {
        System.out.println("A延迟初始化......");
    }
}
```

```java
@Component
@Lazy(value = false)
public class PersonB {
    public PersonB() {
        System.out.println("B延迟初始化......");
    }
}
```

若使用 XML 配置，则在 bean 对象中定义属性 lazy-init，默认为 true，即延迟初始化，bean 对象不与容器同步加载。若设置为 false，bean 对象会在需要时再加载实例化

对于 bean 对象是否需要延迟初始化，根据实际的应用场景判断

# 生命周期
 












