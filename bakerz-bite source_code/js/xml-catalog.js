
(function () {
  'use strict';
  var panel = document.getElementById('bb-xml-catalog');
  var button = document.getElementById('bb-load-xml-catalog');
  var status = document.getElementById('bb-xml-status');
  var list = document.getElementById('bb-xml-products');
  if (!panel || !button || !status || !list) return;

  button.addEventListener('click', function () {
    status.textContent = 'Loading XML catalogue…';
    list.textContent = '';
    fetch('../data/products.xml', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      })
      .then(function (xmlText) {
        var xml = new DOMParser().parseFromString(xmlText, 'application/xml');
        if (xml.querySelector('parsererror')) throw new Error('Invalid XML document');
        var products = Array.prototype.slice.call(xml.querySelectorAll('catalog > product'));
        if (!products.length) throw new Error('No products were found in the XML file');
        status.textContent = 'XML loaded successfully: ' + products.length + ' products found.';
        products.slice(0, 8).forEach(function (product) {
          var name = product.querySelector('name');
          var price = product.querySelector('price');
          var cat = product.querySelector('cat');
          var li = document.createElement('li');
          var strong = document.createElement('strong');
          strong.textContent = name ? name.textContent : 'Unnamed product';
          li.appendChild(strong);
          var detail = document.createTextNode(' — Rs. ' + (price ? price.textContent : 'N/A') +
            ' · ' + (cat ? cat.textContent : 'Uncategorised'));
          li.appendChild(detail);
          list.appendChild(li);
        });
      })
      .catch(function () {
        status.textContent = 'The XML file could not be fetched. Open the project through a local web server (for example VS Code Live Server), not by double-clicking the HTML file. The rest of the website can still run normally.';
      });
  });
})();
