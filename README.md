# Akkeris Detectifier Plugin

CLI commands for the Akkeris Detectifier.

## Introduction

The Akkeris Detectifier scans Akkeris app endpoints for security vulnerabilities with Detectify. It can run scans when a new Akkeris release is created on an app or on demand. 

Scan results are available as a `security_scan` webhook, and for releases, through the Akkeris release status. Scan results are also available through a simple web interface - this includes report details and any associated errors.

You can see a list of currently running scans using the CLI or through the web interface.

To access the web UI: https://akkeris-detectifier.octanner.io

For help with Detectify scores: https://blog.detectify.com/2017/05/24/interpret-detectify-score/

## Commands

`aka detectify:start -a APPNAME -t THRESHOLD`

Start a Detectify scan on a given application. The "threshold" option is optional - it allows you to specify the maximum allowable threat score. Otherwise, the default is "6".

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