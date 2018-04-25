window.incrementalSearch = (function ($, window, document, removeStopWords, undefined) {
  if (!removeStopWords) {
    removeStopWords = function (str) {
      return str;
    }
  }

  function isFunction (fn) {
    return fn && ("function" === typeof fn);
  }

  var REGEX = {
    html: /(<([^>]+)>)/ig,
    punc: /[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,
    white: /\s+/
  };

  var MIN_WORD_LENGTH = 3;

  var ITEM_LINK_CLASS = "result-item-link";

  function formatString (str) {
    return str
      .replace(REGEX.html, "")
      .replace(REGEX.punc, "")
      .toLowerCase();
  }

  function wordsFrom (input) {
    var arr = input.val()
      .replace(REGEX.html, "")
      .replace(REGEX.punc, "")
      .toLowerCase()
      .split(REGEX.white)
      .filter(function (word) {
        return "string" === typeof word && word.length >= MIN_WORD_LENGTH;
      });
    return removeStopWords(arr);
  }

  function subwordsFrom (words) {
    return [].concat.apply([], words.map(function (word) {
      var subword, subwords = [];
      for (var i=MIN_WORD_LENGTH; i<word.length; ++i) {
        subword = word.substring(0, i);
        if (subword.length >= MIN_WORD_LENGTH) {
          subwords.push(subword);
        }
      }
      return subwords;
    }));
  }

  function createSortedMatchesFor (data) {
    return function (words, subwords) {
      return data.filter(function (object) {
        return object.count(words.concat(subwords)) > 0;
      }).sort(function (a, b) {
        return a.count(words) > b.count(words);
      }).reverse();
    }
  }

  function createProto (searchableProps, highlightColor, linkClass) {
    return {
      // counts ocurrences of an array of strings
      count: function (words) {
        var i, word, match = 0, len = words.length;
        for (i=0; i<len; ++i) {
          word = words[i];
          if (word.length < MIN_WORD_LENGTH) {
            continue;
          }
          searchableProps.forEach(function (propName) {
            if (!this[propName]) return false;
            var i2, arr = this[propName];
            for (i2=0; i2<arr.length; ++i2) {
              if (arr[i2].indexOf(word) !== -1) {
                match += 1;
              }
            }
          }, this);
        }
        return match;
      },
      // returns titled with bolded substrings
      highlightedTitle: function (words) {
        var textArr = this.originalTitle.split(REGEX.white);
        var opening = "<span style='font-weight:bold;color:" + highlightColor + ";'>",
            closing = "</span>";
        var titleWord, searchWord, substr, substrIndex;
        for (var i1=0; i1<textArr.length; ++i1) {
          for (var i2=0; i2<words.length; ++i2) {
            titleWord = textArr[i1].toLowerCase();
            searchWord = words[i2].toLowerCase();
            if ((substrIndex = titleWord.indexOf(searchWord)) !== -1) {
              substr = textArr[i1].substr(substrIndex, searchWord.length);
              textArr[i1] = textArr[i1].split(substr).join(opening + substr + closing);
            }
          }
        }
        return textArr.join(" ");
      },
      // returns article info as a jQuery <li>
      asListItem: function (words) {
        var link = $("<a href='#'></a>");
        link.attr("href", this.url);
        link.addClass(linkClass || ITEM_LINK_CLASS);
        link.html(this.highlightedTitle.call(this, words));
        return $("<li></li>").append(link);
      }
    };
  }

  function createData (initialData, prototype, mapping) {
    return initialData.map(function (object) {
      var newObject = $.extend(
        Object.create(prototype),
        object,
        {
          originalTitle: object.title,
          title: formatString(object.title).split(REGEX.white)
        }
      );
      Object.keys(newObject).forEach(function (propName) {
        if (mapping[propName] && "string" === typeof newObject[propName]) {
          var newPropName = mapping[propName]["to"] || propName;
          var delimiter = mapping[propName]["split"];
          var str = formatString(newObject[propName]);
          if (mapping[propName]["removeStopWords"] !== false) {
            str = removeStopWords(str);
          }
          newObject[newPropName] = str.split(delimiter || REGEX.white);
        }
      });
      return newObject;
    });
  }

  function createInputHandler (input, list, fns) {
    return function (e) {
      list.empty();
      var words = wordsFrom(input);
      var subwords = subwordsFrom(words);
      var matches = fns.sortedMatchesFor(words, subwords);
      if (!words.length || !matches.length) {
        if (isFunction(fns.onNoMatches)) {
          fns.onNoMatches(words);
        }
        return false;
      }
      matches.forEach(function (match) {
        list.append(match.asListItem(words));
      });
      if (isFunction(fns.afterAppend)) {
        fns.afterAppend(words, matches);
      }
    }
  }


  // initialization function
  var init = function (settings) {
    var highlightColor = settings.highlightColor || "#000",
        mapping = settings.mapping || {};
    var proto = createProto(settings.searchableProps, highlightColor, settings.linkClass),
        DATA = createData(settings.data, proto, mapping);
    var form = $(settings.form),
        input = form.find("input"),
        list = $(settings.list);
    var handleInput = createInputHandler(input, list, {
      sortedMatchesFor: createSortedMatchesFor(DATA),
      onNoMatches: settings.onNoMatches,
      afterAppend: settings.afterAppend
    });
    input.keyup(handleInput);
    form.submit(function (e) {
      e.preventDefault();
    });
  }
  // replace removeStopWords
  init.stopwordsModule = function (mod) {
    return (typeof mod === "function") && (removeStopWords = mod);
  }
  // return final function
  return init;
})(jQuery, window, document);
