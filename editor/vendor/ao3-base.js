window.AO3_DEFAULT_SITESKIN = String.raw`
/* == CORE: basic functional layout
https://otwcode.github.io/docs/stylesheets-views.html#core
*/

body, .toggled form, .dynamic form, .secondary, .dropdown {
  background: #fff;
  color: #2a2a2a;
  font: 100%/1.125 'Lucida Grande', 'Lucida Sans Unicode', Verdana, Helvetica, sans-serif, 'GNU Unifont';
  margin: 0;
  padding: 0;
}

.heading {
  font-family: Georgia, serif;
}

a, a:link {
  color: #900;
  text-decoration: none;
}

#header, #footer, #main, #dashboard {
  padding: 1em 3em;
}

.landmark {
  font-size: 0;
  opacity: 0;
}

.hidden {
  display: none;
}

li.blurb, fieldset, form dl {
  border: 1px solid #ddd;
  padding: 1em;
  overflow: hidden;
}

.blurb li, .actions>*, .stats>*, .meta ul li {
  list-style: none;
  display: inline;
  padding-left: 0.25em;
}

.actions form {
  display: inline;
}

.actions input[type="submit"] {
  margin: 0;
}

/* END == */

/* == ELEMENTS
https://otwcode.github.io/docs/stylesheets-views.html#elements
*/

/* MEYERS RESET. *********************************************** do not edit */

html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td {
  border: 0;
  outline: 0;
  font-weight: inherit;
  font-style: inherit;
  font-size: 100%;
  font-family: inherit;
  vertical-align: baseline;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* *********************************************** end of uneditable rules */

/* The global rules for normal elements */

body {
  font: 100%/1.125 'Lucida Grande', 'Lucida Sans Unicode', Verdana, Helvetica, sans-serif, 'GNU Unifont';
}

a, a:link, a:visited:hover {
  color: #111;
  text-decoration: none;
  border-bottom: 1px solid;
}

a:visited {
  color: #666;
  text-decoration: none;
  border-bottom: 1px dashed;
}

a:hover {
  color: #999;
}

a:active, a:focus, button:focus {
  outline: 1px dotted;
}

a img {
  border: 0;
}

a:focus img {
  outline: 1px dotted;
}

h1, h2, h3, h4, h5, h6, .heading {
  font-family: Georgia, serif;
  font-weight: 400;
    word-wrap: break-word;
}

h1 {
  font-size: 2.5em;
  line-height: 1;
  margin: 0.5em 0;
}

h2 {
  font-size: 2.143em;
  line-height: 1;
  margin: 0.429em 0;
  display: inline;
}

/* 24px skipped: font-size: 1.714em; line-height: 1; margin: 0.429em 0 */

h3 {
  font-size: 1.286em;
  line-height: 1;
  margin: 0.5375em 0;
}

h4 {
  font-size: 1.143em;
  line-height: 1.125;
  margin: 0.5em 0;
}

h5 {
  font-size: 1em;
  line-height: 1.286;
  margin: 0.643em 0;
}

h6 {
  font-size: 0.875em;
  font-weight: 900;
  line-height: 1.5;
  margin: 1.5em 0;
}

p, li, dd, hr {
  margin: 0.643em 0;
}

hr {
  border: 0;
  border-bottom: 3px double;
}

.clear {
  clear: both;
  height: 0;
  border: 0;
  margin: 0;
  background: transparent;
  opacity: 0;
}

blockquote, pre, address {
  font: 1em 'Lucida Grande', 'Lucida Sans Unicode', Verdana, Helvetica, sans-serif;
  margin: 0.643em;
}

blockquote p:first-child, address p:first-child {
  margin-top: 0;
}

blockquote p:last-child, address p:first-child {
  margin-bottom: 0;
}

kbd, tt, code, var, pre, samp {
  font: normal 0.857em 'Monaco', 'Consolas', Courier, monospace;
  font-variant-ligatures: none;
  margin: auto;
}

pre {
  white-space: pre-wrap;
}

strong, b {
  font-weight: bold;
}

em, cite, i {
  font-style: oblique;
}

cite em, em cite, cite i, i cite, i em, em i, em em, i i, cite cite {
  font-style: normal;
}

em cite, i cite, ins, u {
  text-decoration: underline;
}

del, strike {
  text-decoration: line-through;
}

dfn, abbr, acronym {
  cursor: help;
}

big {
  font-size: 114%;
}

small, sub, sup {
  font-size: 87.5%;
}

small small small small {
  font-size: 100%;
}

sub {
  vertical-align: sub;
  line-height: 0;
}

sup {
  vertical-align: super;
  line-height: 0;
}

/*
https://otwcode.github.io/docs/patterns/tables.html
*/

table {
  background: #ddd;
  border-collapse: collapse;
  margin: auto;
  width: 100%;
  clear: right;
}

caption {
  height: 0;
  width: 0;
  font-size: 0;
  opacity: 0;
  padding: 0;
  margin: 0;
}

thead, tfoot {
  border-bottom: 2px solid #bbb;
  padding: 0.643em;
  vertical-align: top;
}

tfoot td {
  border-top: 1px solid #bbb;
}

td th {
  padding-right: 1em;
}

tbody tr {
  border-bottom: 1px solid #fff;
}

td {
  padding: 0.25em;
  vertical-align: top;
}

th {
  text-align: start;
}

thead td {
  background: #ddd;
  border-bottom: 1px solid #fff;
}

th, tr:hover, col.name {
  background: #fff;
  border: 1px solid #bbb;
  padding: 0.15em 0.5em 0.25em;
  vertical-align: top;
}

th a, th a:visited, th a:link {
  text-decoration: none;
}

tbody tr th {
  text-align: start;
}

/* END == */

/* == USERSTUFF: displaying content inputted by a user into a textarea. */

.userstuff {
    word-wrap: break-word;
    line-height: 1.5;
}

.userstuff p, .userstuff details {
  margin: 1.286em auto;
  padding: 0;
}

/* lists */

.userstuff dl {
  margin: 1.5em 0;
  border: 0;
}

.userstuff dl dl {
  width: 90%;
  margin: auto;
}

.userstuff dt {
  display: block;
  font-weight: bold;
}

.userstuff dd {
  display: block;
  margin-block-start: 1.25em;
  margin-block-end: 1.25em;
  margin-inline-start: 3em;
}

.userstuff dd p {
  margin: 0;
  padding: 0;
}

.userstuff ul {
  margin: 1.125em auto;
  padding: 0 1em;
}

.userstuff ul li {
  display: list-item;
}

.userstuff li, .userstuff ol ul li {
  font-weight: normal;
  display: list-item;
  list-style-type: disc;
  margin-block-start: 0.75em;
  margin-inline-end: 0;
  margin-block-end: 0.75em;
  margin-inline-start: 1.75em;
}

.userstuff ol {
  margin: 0.75em auto;
  padding: 0 1.5em;
}

.userstuff ol li {
  list-style-type: decimal;
  margin-block-start: 0.75em;
  margin-inline-end: 0;
  margin-block-end: 0.75em;
  margin-inline-start: 1.75em;
}

.userstuff ol li ol li {
  list-style-type: lower-alpha;
}

.userstuff ol li ol li ol li {
  list-style-type: lower-roman;
}

/* headings */

.userstuff h1 {
  text-align: center;
}

.userstuff h2 {
  color: #333;
  margin: 1.5em 0;
  display: block;
}

.userstuff h3 {
  font-weight: 500;
  padding: 0.125em;
  border-bottom: 0.25em double #333;
}

.userstuff h4 {
  font-weight: 700;
}

.userstuff h5 {
  font-weight: 600;
  font-size: 1em;
}

.userstuff h6 {
  font-size: 0.975em;
  border-bottom: 1px solid;
}

.userstuff h3 a, .userstuff h3 a:link, .userstuff h3 a:visited {
  font-weight: 500;
  border-bottom: 0;
  text-decoration: none;
}

/* tables */

.userstuff caption {
  font-size: 1em;
  height: auto;
  width: auto;
    opacity: 1;
}

.userstuff table, .userstuff td, .userstuff col, .userstuff tr, .userstuff thead, .userstuff tfoot, .userstuff tbody, .userstuff th, .userstuff thead td, .userstuff th a, .userstuff th a:link {
  background: transparent;
  border: none;
}

/* quotes and stresses */

.userstuff blockquote, .userstuff address {
  line-height: 1.5;
  margin-inline-start: 1.5em;
  padding: 0.75em;
  border-inline-start: 2px solid #999;
}

.userstuff blockquote blockquote {
  padding: 0.25em;
  border: 0;
}

.userstuff hr {
  width: 33%;
  margin: 0.875em auto 1.2525em auto;
  border: 1px solid;
}

/* media */

.userstuff img {
  max-width: 100%;
  height: auto;
}

.userstuff video {
  max-width: 100%;
}

/* expected behaviours, exceptioning */

/* WORK MARGINS */

#workskin {
  font-size: 1.08em;
  margin: auto;
  padding: 0 0.25em;
  max-width: 72em;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
}

#workskin .module {
  float: none;
}

/* contexts */

.comment .userstuff li {
  list-style-position: inside;
}

.comment .userstuff blockquote {
    display: flow-root;
}

.bookmark .user .userstuff {
  line-height: 1.5;
}

.bookmark .user .userstuff blockquote {
  margin-bottom: 1.286em;
}

.faq .userstuff dd {
  margin-block-start: 0.75em;
  margin-block-end: 0.75em;
  margin-inline-start: 1.75em;
}

.faq .userstuff dl {
  margin: 0.75em 0;
}

/* END == */

body {
  padding: 1em 3em;
}
`;
