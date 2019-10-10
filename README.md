# minilink - URL Shortener Microservice Test

[![HitCount](http://hits.dwyl.com/hchiam/minilink.svg)](http://hits.dwyl.com/hchiam/minilink)

Demo: [https://minilink.glitch.me](https://minilink.glitch.me)

Code: [https://glitch.com/edit/#!/minilink](https://glitch.com/edit/#!/minilink)

To make your own copy, you'll need a .env file with these:

```shell
USER=...
PASS=...
HOST=...
DB_PORT=...
DB=...
COLLECTION=...

# (replace "..." with values, no spaces allowed) 
```

## Example:

**Calling** https://minilink.glitch.me/new/https://www.google.com

-> **Returns** [https://minilink.glitch.me/hswxZ](https://minilink.glitch.me/hswxZ)

-> **Redirects to** https://www.google.com

## References:

mLab setup: [Medium article from chingu](https://medium.com/chingu/url-shortener-microservice-4f7743fd1d56)

glitch.com template: [jordanleo7's URL-Shortener code](https://github.com/jordanleo7/URL-Shortener)
