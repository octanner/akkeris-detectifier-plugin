# Akkeris Detectifier Plugin

CLI commands for the Akkeris Detectifier.

## Introduction

The Akkeris Detectifier scans Akkeris app endpoints for security vulnerabilities with Detectify when a new release is created. It automatically updates the Akkeris release status with the current status of the scan along with any results or errors.

You can see a list of currently running scans using the CLI or through a simple web interface. Viewing past scans is also available through the web interface, and includes report details and any associated errors.

To access the web UI: https://akkeris-detectifier.octanner.io

For help with Detectify scores: https://blog.detectify.com/2017/05/24/interpret-detectify-score/

## Commands

`aka detectify:enable -a APPNAME`

Enable Detectify scanning for a given application

`aka detectify:disable -a APPNAME`

Disable Detectify scanning for a given application

`aka detectify:scans`

Show currently running scans

## Future Plans

- Ability to run on-demand scans for any app or site
- Show past scans using the CLI
- PDF scan results (currently, Detectify does not offer this feature programmatically)