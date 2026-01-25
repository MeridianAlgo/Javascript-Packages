# Security Policy

## Supported Versions

We only provide security updates for the current major version.

| Version | Supported          |
| ------- | ------------------ |
| 4.x.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within MeridianAlgo, please send an e-mail to security@meridianalgo.example.com (Placeholder). All security vulnerabilities will be promptly addressed.

Please include the following in your report:
- Type of issue (e.g., buffer overflow, SQL injection, insecure dependency)
- The location of the issue (file, line number, or API endpoint)
- A brief description of the vulnerability
- Steps to reproduce the issue

We will acknowledge your report within 48 hours and provide a timeline for a fix.

## Security Practices

- We regularly audit our dependencies using `npm audit`.
- We use GitHub Actions to run security scans on every PR.
- We avoid using `eval()` or other dangerous JavaScript patterns.
