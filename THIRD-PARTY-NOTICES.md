# Third-party notices

ShapeShft's own files are under the MIT License (see LICENSE). The Resume Workbench includes the following third-party software. Both are built into `ShapeShft-Resume-Workbench.html` in each release, and the unmodified files are in `workbench/vendor/` in the repository.

No fonts, images or other third-party assets are distributed. The tools use fonts already on the user's device. The PDFs use the standard PDF fonts Helvetica and Times, which are not embedded.

---

## jsPDF 2.5.1

- Source: https://github.com/parallax/jsPDF (file `dist/jspdf.umd.min.js`, npm package `jspdf@2.5.1`)
- License: MIT
- Checked: the npm package file and the cdnjs file have the same SHA-256 hash (98ccf17aa10c20bb1301762618fcc9b6ab3a4e7f26b6071d64d0b41154df3875).
- The built file includes components with their own permissive notices, kept in the file's comments: fflate (MIT), standard font metrics derived from Adobe Core 14 font metric files (Adobe permits use, copying and distribution of these metrics), and code adapted from other MIT-licensed projects as credited in the file header.

```
Copyright
(c) 2010-2021 James Hall, https://github.com/MrRio/jsPDF
(c) 2015-2021 yWorks GmbH, https://www.yworks.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

The full license text from the package is in `workbench/vendor/jspdf-LICENSE.txt`.

---

## pdf-lib 1.17.1

- Source: https://github.com/Hopding/pdf-lib (file `dist/pdf-lib.min.js`, npm package `pdf-lib@1.17.1`)
- License: MIT
- Checked: the npm package file and the cdnjs file have the same SHA-256 hash (0f9a5cad07941f0826586c94e089d89b918c46e5c17cf2d5a3c6f666e3bc694f).
- The built file bundles: @pdf-lib/standard-fonts (MIT, with Adobe Core 14 font metrics), @pdf-lib/upng (MIT), pako (MIT and Zlib licenses), and tslib (0BSD).

```
MIT License

Copyright (c) 2019 Andrew Dillon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

The full license text from the package is in `workbench/vendor/pdf-lib-LICENSE.txt`.
