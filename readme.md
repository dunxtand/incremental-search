# jQuery Incremental Search

A small jQuery-dependent module that searches an array of objects and adds links to a list as the user types.

### Required Configuration

The text input element must be within a form, and must be the only input element in that form.

The list element must be of type ul or ol.

### Usage

Install via npm and require module:

````bash
npm install incremental-search
````
````javascript
var incrementalSearch = require("incremental-search");
````

Link to on page:

````html
<script src="/path/to/incremental-search.min.js">
````

Or just add contents of build/incremental-search.min.js to page.

Initialize with required and optional arguments:

````javascript
incrementalSearch({
    // REQUIRED
    data: [
        // each object must have string properties 'title' and 'link'
        {title: "A Title of a Page", url: "/path/to/page"},
        {title: "Another", url: "/an/other"}
    ],
    searchableProps: ["title"], // properties of data objects to search
    form: "#search-form", // selector for form element
    list: "#search-list", // selector for list element


    // OPTIONAL
    highlightColor: "#006cff", // color to highlight matched words in title
    linkClass: "class-to-give-the-anchor-elements",
    onNoMatches: function (words) {
        // called when there are no input matches
        // words is array of strings from user input
    },
    afterAppend: function (words, matches) {
        // called after results are appended to list
        // words is array of string from user input
        // matches is array of objects that matched query
    },
    mapping: { // more about this below
        added_tags: {
            to: "tags"
            split: ", ",
            removeStopWords: false
        }
    }
});
````

When matches are found, each match is appended to the list in the following format:

````html
<li>
    <a href="/path/to/page" class="class-to-give-the-anchor-elements">
        A Title of a Page
    </a>
</li>
````

All matches are removed before each new search (before each input 'keyup' event).

### Mapping

Use the 'mapping' argument to tell the module how to configure certain properties of the objects in the data array:

````javascript
added_tags: { // original name of property
    to: "tags", // new name of property
    split: ", ", // how to turn the property into an array (defaults to any amount of whitespace)
    removeStopWords: false // whether or not to remove common words (defaults to true)
}
````

## Notes

* **Removing Stop Words**: You must pass in your own module to remove [stop words](https://en.wikipedia.org/wiki/Stop_words). Pass it into the module like so, before calling the function:

````javascript
incrementalSearch.stopwordsModule(stopwordsModule);
````

It must be a function that takes a string and returns a new string.

* **Removing HTML and punctuation**: All searchable properties will be cleared of HTML and punctuation marks.
