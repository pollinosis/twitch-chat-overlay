# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2024-01-XX
### Added
- SPA navigation support - automatically reinitializes when switching channels
- Drag & drop functionality for overlay positioning
- Cleanup script for proper resource management
- GitHub Actions for automated releases

### Fixed
- Chat messages not loading when switching between channels
- Memory leaks from multiple observer instances
- "Connecting to chat" persistent loading issue

### Changed
- Improved page detection logic
- Enhanced error handling and retry mechanisms
- Better debug logging for troubleshooting

## [1.0.0] - 2024-01-XX
### Added
- Initial release
- Real-time Twitch chat overlay
- Customizable appearance (opacity, font size, message count)
- Username color preservation
- Smooth fade-in animations
- Privacy-focused design (no data collection)
- Settings popup for configuration

[Unreleased]: https://github.com/1kaguya/twitch-chat-overlay/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/1kaguya/twitch-chat-overlay/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/1kaguya/twitch-chat-overlay/releases/tag/v1.0.0