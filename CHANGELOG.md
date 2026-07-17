# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 (2026-07-17)


### Features

* add --logfile option to log skipped/error files ([6f5347e](https://github.com/milbar/bulk-optimize-images-locally/commit/6f5347e1d36c845a0505e7bd4b6e4209c4d86999))
* add options for JPEG quality, PNG level, mozjpeg, adaptive filtering ([0d952e6](https://github.com/milbar/bulk-optimize-images-locally/commit/0d952e677d1007b83721cca8aecd917c838f8917))
* initial release of @milbareu/optimize-images ([afbca77](https://github.com/milbar/bulk-optimize-images-locally/commit/afbca77ab3f1fd3a2ccfb46b2444e4e620cfa806))


### Bug Fixes

* update husky hooks to v9 format ([68ba0a3](https://github.com/milbar/bulk-optimize-images-locally/commit/68ba0a327eb5dd470add9e542ad91155fe46ee64))
* use PAT token for release-please PR creation ([3502fe3](https://github.com/milbar/bulk-optimize-images-locally/commit/3502fe33b5f01e17c5b1bd13643be0e51faf552d))

## [1.0.0] - 2026-07-17

### Added

- Initial release
- Recursive JPEG/PNG optimization with sharp
- CLI command `optimize-images` with file/directory arguments
- Programmatic API: `findImages`, `optimize`, `runPool`, `main`
- 10 concurrent workers
- In-place optimization with safe temp-file write
