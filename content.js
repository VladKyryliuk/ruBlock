var blockedKeywords = /.ru|ru.|russia/;

// Функція для перевірки, чи містить текст російські символи
function hasRussianCharacters(text) {
  return blockedKeywords.test(text);
}

// Функція для фільтрації результатів пошуку
function filterResults() {
  var searchResults = document.querySelectorAll('.g'); // Вибираємо всі результати пошуку

  searchResults.forEach(function(result) {
    var linkElement = result.querySelector('a');
    var linkHref = linkElement.getAttribute('href');
    // var linkText = linkElement.textContent;

    if (hasRussianCharacters(linkHref)) {
      result.style.display = 'none'; // Приховуємо результати з російськими символами
    }
  });
}
filterResults();
// window.addEventListener('load', filterResults);