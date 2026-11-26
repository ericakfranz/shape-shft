# Security

## Reporting a problem

If you find a security problem, please report it privately. Do not open a public issue.

Use GitHub's private vulnerability reporting: on the repository page, open the **Security** tab and choose **Report a vulnerability**. If that option is not available, open a public issue that says only "I have a security report, please contact me", with no details.

Please include what you found, the steps to reproduce it, and which file or tool is affected. Do not include anyone's personal information.

## What is in scope

- The Resume Workbench (`workbench/`) and the Practice Guide Builder (`coach/`), for example a way for loaded JSON or pasted text to run code, send data over the network, or read other files.
- The offline guide format, for example a way for guide text to produce a script, an event handler, an external request or a link outside the guide.
- Build tools that could put personal data or untrusted code into a release.

## How ShapeShft limits risk

- No server, no accounts, no analytics, no network requests.
- The release versions of the tools include a Content Security Policy that blocks network connections.
- All text inserted into pages is escaped. Offline guides are built only from escaped text and fixed markup, then checked before saving.
- Offline guides contain no JavaScript at all, and a restrictive Content Security Policy.
- Third-party code (jsPDF and pdf-lib) is pinned to exact versions, checked against both the CDN and npm copies, and built into the files.

No approach makes a file perfectly secure. Treat your career files, applications and guides as private personal information.

## Supported versions

Only the latest release receives fixes.
