[![Index ](https://img.shields.io/travis/Chicago/opengrid/opengrid.io.svg?style=flat-square)](https://travis-ci.org/Chicago/opengrid)

# opengrid.io

The code in the `opengrid.io` branch is deployed to the [OpenGrid homepage](www.opengrid.io).

## Build & Testing

Commits to this branch are sent to Travis CI and tested with [htmlproofer](https://github.com/gjtorikian/html-proofer) to ensure all links do not return a 4xx error (e.g., 404) and that the HTML is well-formed. When successful, the code is copied to www.opengrid.io.