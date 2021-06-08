
require([
  "gitbook"
], function(gitbook) {
   var nvigationConfig = {};
    gitbook.events.bind("start", function(e, config) {
      console.log('gitbook:start', config)
      nvigationConfig = config.nvigation || {};
    });
    gitbook.events.bind("page.change", initNav);

    function initNav() {
      console.log('nvigation page change', nvigationConfig)
      var ul = document.createElement('ul')
      ul.className = 'nav-list'

      var navigatorList = nvigationConfig.navigatorList || []

      for (var i = 0; i < navigatorList.length; i++ ) {
        var item = navigatorList[i]
        var li = document.createElement('li')
        li.className = 'nav-item'
        var a = document.createElement('a')
        a.innerHTML = item.name
        a.setAttribute('href', item.url)
        li.appendChild(a)
        ul.appendChild(li)
      }

      function insertAfter(newElement, targetElement){
        var parent = targetElement.parentNode;
        if (parent.lastChild == targetElement) {
          parent.appendChild(newElement);
        } else {
          parent.insertBefore(newElement, targetElement.nextSibling);
        }
      }

      insertAfter(ul, document.querySelector('.book-header'))

    }
})
