# 简介

Servlet（Server Applet），全称 Java Servlet。是用 Java 编写的服务器端程序。其主要功能在于交互式地浏览和修改数据，生成动态 Web 内容。狭义的 Servlet 是指 Java 语言实现的一个接口，广义的 Servlet 是指任何实现了这个 Servlet 接口的类，一般情况下，人们将 Servlet 理解为后者。

Servlet 运行于支持 Java 的应用服务器中。从实现上讲，Servlet 可以响应任何类型的请求，但绝大多数情况下 Servlet 只用来扩展基于 HTTP 协议的 Web 服务器。

最早支持 Servlet 标准的是 JavaSoft 的 Java Web Server。此后，一些其它的基于 Java 的 Web 服务器开始支持标准的 Servlet。

上述文字，引用自维基百科，对于 Servlet，在后续的介绍中可以充分理解

# 入门

这里，将做 Servlet 的入门介绍，了解 JavaEE 中的 WEB 方向的基石是如何工作的

## Servlet 应用搭建

对于 Servlet 的应用搭建，采用 Maven 的方式，IDEA 在新版本中取消了 JavaEE 应用的直接构建

第一步：建立空的 Mavne 项目，引入 Servlet 依赖

```xml
<dependency>
	<groupId>javax.servlet</groupId>
	<artifactId>javax.servlet-api</artifactId>
	<version>4.0.1</version>
</dependency>
```

第二步：在 src/main 目录下新建 webapp 目录，与 java 目录在同一级，其中 resources 目录可以删除

```
src
	main
		java
		webapp
```

第三步：在 webapp 目录下新建如下内容，并写入 xml 信息，并根据 IDEA 的右下角提示，完成构建

```
webapp
	WEB-INF
		web.xml
	index.jsp
```

```xml
<!-- web.xml -->
<!DOCTYPE web-app PUBLIC
 "-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN"
 "http://java.sun.com/dtd/web-app_2_3.dtd" >

<web-app>
  <display-name>Archetype Created Web Application</display-name>
</web-app>
```

```html
<!-- index.jsp -->
<html>
<body>
<h2>Hello World!</h2>
</body>
</html>
```

第四步：部署 Tomcat，配置路径信息等，位于 IDEA 右上角

第五步：新建 Java 类，细节如下，核心为继承 HttpServlet、重写 service()、注解 @WebServlet()

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {
    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        System.out.println("...");
    }
}
```

此时，启动 Tomcat，进入配置的 URL 路径，可以看到控制台打印的信息

## Servlet 实现原理

Servlet 是位于服务端的程序，普通的 Java 类可以继承 HttpServlet，转换为一个 Servlet 程序

可以看出，Servlet 程序不存在 main 方法，它是被动的接收请求与返回响应

简单的理解，Servlet 程序部署在 WEB 应用服务器上，例如主流的 Tomcat，由 Tomcat 管理 Servlet 程序

现在，通过 IDEA 打开 HttpServlet 的继承图，可以看出

1. HttpServlet 类继承了 GenericServlet 类
2. GenericServlet 类又实现了 Servlet 接口

也就是说，Servlet 实际上是 Java 中的一个接口、一种规范

而为什么是继承 HttpServlet，则是因为，HttpServlet 基于 Serlvet 接口规范、提供了大量的可用方法

简单的理解为，ArrayList 作为 Collection 接口的具体实现类，提供了大量的使用方法

至于服务端、WEB 端通信的 HTTP 协议，则可以理解为容器的数据结构，可以单独去学习，Servlet 的学习不必要深究 HTTP

## Servlet 生命周期

一个 Servlet 程序，存在着生命周期，而 Servlet 的生命周期，实质上是交由 WEB 容器负责管理


```java
void init(ServletConfig var1) throws ServletException;

void service(ServletRequest var1, ServletResponse var2) throws ServletException, IOException;

void destroy();
```

上述为 Servlet 接口中定义的部分抽象方法，代表着 Servlet 程序的生命周期

对于 Servlet 的生命周期，分为三个阶段

初始阶段：请求到达该 Servle 程序，则该 Servlet 程序实例化对象，仅且执行一次

服务阶段：此阶段不断地进行请求与响应，可执行多次

销毁阶段：Servlet 程序销毁，仅且执行一次

请看下方示例，结合 Tomcat 控制台的日志信息

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {
	@Override
	public void init(ServletConfig config) throws ServletException {
		System.out.println("Servlet 初始化");
	}

	@Override
	public void service(ServletRequest req, ServletResponse res) {
		System.out.println("Servlet 服务中");
	}

	@Override
	public void destroy() {
		System.out.println("Servlet 已销毁");
	}
}
```

此时，运行 Tomcat，并访问该路径，则可以看到初始、服务的信息被打印，再关闭 Tomcat，可以看到关闭前 Servlet 程序的销毁信息

# 请求与响应

对于 Servlet 程序，它的主要职责就是接收请求数据、返回响应数据，对应的方法是 HttpServletRequest、HttpServletResponse

**HttpServlet 是 Servlet 的实现类，基于 HttpServlet 讲解 Servler 程序**

## HttpServletRequest 请求

### 基本使用

HttpServletRequest 负责接收 WEB 端传递到服务端的数据，部分常用的方法有

- `getRequestURL()`：获得客户端发送请求时的完整的 URL
- `getRequestURI()`：获取项目中的相对 URL
- `getQueryString()`：获取请求的参数
- `getParameter()`：获得指定的参数
- `getMethod()`：获取请求的方式
- `getprotocol()`：获取 HTTP 版本号

对于更多更具体的参考，请查阅 JavaEE API 手册

### 请求乱码

若传递的参数中存在中文，就可能存在乱码的问题，原因在于 Tomcat 的默认编码

对于请求的方式，分为两种 GET 请求、POST 请求，值得注意的是，高版本的 Tomcat 不存在 GET 请求乱码

当然，若使用的是 getQueryString() 方法，依旧会乱码，这里指的请求参数获取是指 getParameter() 方法

现在，重点解决的是 POST 请求参数乱码，方法如下

```java
// 根据 UTF-8 编码进行字符的解码
req.setCharacterEncoding("utf-8");
```

这里提一点，若在 JSP 页面传递数据，必须做以下的声明标签，否则会传递中文的 GDK 编码，这不是乱码

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
```

### 请求转发

在接收请求时，可以将数据转发至其它的 Servlet 程序进行处理，下方为具体代码示例

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("utf-8");
        String userName = req.getParameter("userName");
        req.getRequestDispatcher("test01").forward(req, resp);
    }
}
```

```java
@WebServlet("/test01")
public class Servlet01 extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("utf-8");
        System.out.println("成功接收转发的请求：" + req.getParameter("userName"));
    }
}
```

此时，第一个 Servlet 程序不再打印参数，请求被转发到第二个 Servlert 程序

值得注意的是，**请求转发是服务端的行为，页面的地址栏并不会发生变更**

### request 域对象

在上述的请求转发中，可以看出，第二个 Servlet 并未获得参数，却可以打印参数，原因在于：**一次请求转发中的 Servlet 程序共享一个 Request 作用域**

仔细观察代码，在做请求转发时，除了指定转发的地址，也传入了 request、response 两个对象

除了从页面请求中获得的数据，也可以手动往 request 作用域中添加数据

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("utf-8");
        req.setAttribute("hxd","hxd,gys!!!");
        req.getRequestDispatcher("test01").forward(req, resp);
    }
}
```

```java
@WebServlet("/test01")
public class Servlet01 extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("utf-8");
        System.out.println(req.getAttribute("hxd"));
    }
}
```

对于 request 作用域存、取数据，用到了两个 API 方法

- `req.setAttribute(String str, Object obj)`：存储数据，以类似键值的形式
- `req.getAttribute()`：读取数据，根据存储的键

## HttpServletResponse 响应

### 基本使用

现在，介绍response对象，用于响应WEB端的请求，返回数据

对于数据的响应，存在两种方式：以字符形式响应、以字节形式响应

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 以字符流的形式响应数据
        PrintWriter writer = resp.getWriter();
        writer.write("123");

        // 以字节流的形式响应数据
        ServletOutputStream stream = resp.getOutputStream();
        stream.write("456".getBytes());
    }
}
```

注意，两种响应的方式，不可以同时使用，response 对象只可以使用一种方式做响应数据

第二种响应方式会被无视，也可能导致异常问题

当然，一种方式可以做多次数据响应，如下所示

```Java
PrintWriter writer = resp.getWriter();
writer.write("123");
writer.write("456");
```

### 响应乱码

同样的，在使用中文做响应数据时，也会出现乱码的问题，解决方法如下

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 指定服务端编码
        resp.setCharacterEncoding("UTF-8");
        // 指定客户端解码
        resp.setHeader("Content-Type","text/html;charset=UTF-8");
        PrintWriter writer = resp.getWriter();
        writer.write("好兄弟");
    }
}
```

需要注意的是，必须同时指定服务端、客户端的编码、解码方式，做到保持一致

### 重定向

重定向，与请求转发不同，它是将页面重定向到另一个页面

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Content-Type","text/html;charset=UTF-8");
        resp.sendRedirect("index.jsp");
    }
}
```

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
<h1>首页吧！</h1>
</body>
</html>
```

此时，任何页面发送请求至该 Servlet 程序，都将被重定向到另一个页面

简单的理解，重定向是客户端行为，地址栏也会发生变更

## 请求转发与重定向

在上述的请求、响应中介绍了请求转发与重定向，这里做统一的比较

请求转发是发生在服务端的行为，不对地址栏产生影响，同时， **仅可以在服务端内部进行请求转发**

重定向是发生在客户端的行为，服务端仅作为中介，会对地址栏产生影响，且可以跳转至互联网的任意位置

# 会话管理

在之前的请求响应中，服务端不会对客户端做任何的记录

会话管理，即服务端对客户端的访问做状态处理，通过两个技术 Cookie、Session

## Cookie

### 存取 Cookie

Cookie 是由服务端创建的，保存在客户端的会话信息，示例如下

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) {
        // 新建一个 Cookie 对象
        Cookie cookie = new Cookie("userName", "好兄弟");
        // 将 Cookie 对象响应回客户端
        resp.addCookie(cookie);
    }
}
```

此时，打开浏览器控制台，可以在存储中看到响应的 Cookie 数据

同样的，服务端也可以读取客户端保存的 Cookie 数据

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) {
        // Java 中仅支持以数组的形式获取 Cookie
        Cookie[] cookies = req.getCookies();
        for (Cookie cookie : cookies) {
            System.out.println(cookie.getName());
            System.out.println(cookie.getValue());
        }
    }
}
```

### Cookie 失效

对于 Cookie 会话，它是存在着默认的有效时间，不指定则由存储的浏览器决定

对于 Cookie，服务端可以指定它的有效时间，存在三种情况，设置 Cookie 时间的方法是 setMaxAge()

```java
// 单位为秒，即该 Cookie 有效期为十秒
cookie.setMaxAge(10);
// 负整数，该 Cookie 存活至浏览器关闭
cookie.setMaxAge(-1);
// 设置为零，即删除该 Cookie，直接失效
cookie.setMaxAge(0);
```

值得注意的是，Cookie 设置为零，只对指定了具体存活时间的 Cookie 有效

另外，若在 Cookie 的有效期内，浏览器关闭，该 Cookie 并不会直接失效，只会等待时间的到期

对于存活至浏览器关闭的 Cookie，无法通过服务端使其失效

### Cookie 路径

对于 Cookie 数据的存储，可以为其指定路径，大致可以分为四类

设置 Cookie 路径的方法为 setPath()

第一类：服务端的任何 Servlet 程序都可以获取 Cookie 对象 `setPath("/")`

第二类：创建该 Cookie 的项目路径的 Servlet 程序可以获得，这是默认情况 `setPath("/创建的路径")`

第三类：指定项目路径的 Servlet 程序可以获得该 Cookie 对象 `setPath("/指定的其它路径")`

### Cookie 细节

对于 Cookie 的使用，需要注意几点

第一，Cookie 的键不可以，也不应该为中文，这可能会导致错误

第二、同名 Cookie 的存储，会默认覆盖之前的 Cookie

第三，Cookie 存在大小的限制，一般只用于存储重要的数据信息

第四、Cookie 存在于浏览器中，存在被浏览器禁用的可能

## Session

### Session 使用

Session是特殊的Cookie，在用法上大致相同

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) {
        // 获取Session对象，若不存在则新建
        HttpSession session = req.getSession();
        // 获取Session对象的唯一标识
        System.out.println(session.getId());
        // 获取Session对象的创建时间
        System.out.println(session.getCreationTime());
        // 获取Session对象的最后访问时间
        System.out.println(session.getLastAccessedTime());
        // 判断该Session是否是新的对象，即服务端是否记录了该Session
        System.out.println(session.isNew());
    }
}
```

对于 Session 的唯一标识 JSESSIONID 需要格外注意，它存储于浏览器中，标识唯一 Session

值得注意的是，对于 JSESSIONID 的无意义修改、删除，会使得服务端认为不存在 Session 对象，则会新建一个 Session

另外，被覆盖的 JSESSIONID 依旧被记录在服务端中，此时，若将最开始的 JSESSIONID 写入，则服务端不会认为这是一个新的 Session 对象

作为特殊的 Cookie，Session 也存在有效期，默认为为浏览器关闭，即 Cookie 有效期设置为 - 1

### Session 域对象

与 request 类似，Session 也存在特定的域对象

Session 域对象，仅在一次 Session 会话中有效，数据不会在多个 Session 中共享，这与 request 一次请求中共享相似

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) {
        HttpSession session = req.getSession();
        session.setAttribute("userName", "里斯");
        System.out.println(session.getId());
        System.out.println(session.getAttribute("userName"));
    }
}
```

可以通过 removeAttribute() 在 Session 域对象中移除指定的数据

### Session 销毁

对于 Session 对象的销毁，存在着多种方式

第一种：依赖 Tomcat 应用服务器中默认 Session 失效时间

打开 Tomcat 中的 conf 目录，在其中的 web.xml 存在以下的配置

```xml
<!-- 单位为分钟，若三十分钟内该 Session 对象无操作则关闭，否则刷新时间 -->
<session-config>
	<session-timeout>30</session-timeout>
</session-config>
```

第二种：指定 Session 对象的默认有效时间

调用方法 getMaxInactiveInterval()，单位为秒

第三种：手动直接销毁，使用较多

调用方法 invalidate()，直接销毁 Session 对象

第四种：浏览器关闭

当前浏览器关闭，Session 会话销毁

# ServletContext 对象

## ServletContext 概念

每一个 Tomcat 应用服务器启动的 WEB 应用中，仅且仅存在一个 ServletContext 对象，也可以称为 Application 对象，它的作用域是整个 WEB 应用程序的运行期间

当一个应用程序创建时，ServletContext 对象被创建；当一个应用程序销毁时，ServletContext 对象被销毁

对于 ServletConetxt 对象，它存在两大作用

1. 实现全局范围内的数据共享
2. 存储当前应用程序的相关信息

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) {
        // 获取当前应用服务器的信息
        System.out.println(getServletConfig());
        // 获取当前 WEB 应用程序的信息
        System.out.println(getServletContext());
        // 获取当前 Servlet 程序的全限定名
        System.out.println(getServletName());
    }
}
```

由于 ServletContext 对象是在服务器启动时创建，全局作用域的对象，可以直接调用该对象的对应方法

## ServletContext 对象的获取方式

对于ServletContext对象，存在四种获取的方式，上述的示例已经介绍了一种，直接获取ServletContext对象

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) {
        // 直接获取
        ServletContext servletContext = getServletContext();
        // request 对象获取
        ServletContext servletContext1 = req.getServletContext();
        // session 对象获取
        ServletContext servletContext2 = req.getSession().getServletContext();
        // ServletConfig 对象获取
        ServletContext servletContext3 = getServletConfig().getServletContext();
    }
}
```

## ServletContext 域对象

ServletContext 也可以作为域对象，是哦也能够方法大致与 request、session 相同

```java
@WebServlet("/test")
public class Servlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) {
        ServletContext servletContext = req.getServletContext();
        servletContext.setAttribute("userName", "里斯");
        System.out.println(servletContext.getAttribute("userName"));
        servletContext.removeAttribute("userName");
    }
}
```

可以看出，使用方法上一致

## Servlet 三大域对象

现在，Servlet 中一共存在了三个域对象，request 域对象、session 域对象、ServletContext 域对象

这三个域对象，其中以 request 的作用域最小，仅在一次请求转发中有效；而 ServletContext 作用域最大，直到服务器关闭才会失效

当然，由于在真正的项目开发中，服务器长期处于开启状态，需要格外注意域对象的使用，不可让无意义的数据长时间占据内存

基于此，应当使用作用域较小的 request 域对象、session 域对象，对于 ServletContext 域对象需要避免使用

# 小结

Servlet 作为 JavaEE 的一种规范，在技术层面上，已经落后于时代，现在大多使用基于 Servlet 规范封装的其它技术，例如 Spring Servlet。并且，Servlet 原始的文件上传下载较为简陋，也大多可以使用 Apache 提供的工具包做替代
