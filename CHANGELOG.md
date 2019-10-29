# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2019-10-29

### Added
- strings.noneSelected option

### Changed
- ajaxOptions option is now passed the MultiListControl instance

## [0.3.0] - 2019-10-28

### Added
- maxSelected option
- searchDebounce option
- strings option
- reset() method
- eslint config
- Message when not items selected
- Selector loading spinner

### Changed
- Updates style of drag-and-drop ordering

### Fixed
- Code style fixes
- Adds debounce to suggestions search
- Clears suggestions list before repopulating with new suggestions
- Makes suggestions dropdown only show when suggestions available
- Prevents selecting an option that has already been selected
- Fixes issues when using integer keys
- Prevents drag-and-drop errors in Firefox

## [0.2.0] - 2019-10-17
### Added
- data option
- getSelected() method
- Adds a changelog

## [0.1.1]  - 2019-10-16
### Fixed
- Fixes package name

## [0.1.0] - 2019-10-16
### Added
- Initial release

[Unreleased]: https://github.com/freshleafmedia/multi-list-control/compare/1.0.0...HEAD
[1.0.0]: https://github.com/freshleafmedia/multi-list-control/compare/0.3.0...1.0.0
[0.3.0]: https://github.com/freshleafmedia/multi-list-control/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/freshleafmedia/multi-list-control/compare/0.1.1...0.2.0
[0.1.1]: https://github.com/freshleafmedia/multi-list-control/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/freshleafmedia/multi-list-control/releases/tag/0.1.0
