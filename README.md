# Fixed Header
Domodule Library to show a header on scroll up on mobile devices.

## Installation

```sh
npm install fixed-header
```

## Usage

Use the [CSS](example/offcanvas.css) that's shown on the example and customise to your needs. Keep `width` and `translate` similar.

```html
<body>
 <header class="fixed-header" data-module="FixedHeader" data-module-match="(max-width: 767px)">
   <h1>My header</h1>
 </header>

 ... content
</body>
```