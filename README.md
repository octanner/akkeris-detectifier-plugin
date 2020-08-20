# Akkeris Detectifier Plugin

CLI commands for the Akkeris Detectifier.

## Introduction

The Akkeris Detectifier scans Akkeris app endpoints for security vulnerabilities with Detectify. It can run scans when a new Akkeris release is created on an app or on demand. 

Scan results are available as a `security_scan` webhook, and for releases, through the Akkeris release status. Scan results are also available through a simple web interface - this includes report details and any associated errors.

You can see a list of currently running scans using the CLI or through the web interface.

To access the web UI: https://akkeris-detectifier.octanner.io

For help with Detectify scores: https://blog.detectify.com/2017/05/24/interpret-detectify-score/

## Commands

`aka detectify:start -a APPNAME -t THRESHOLD -s SITE`

Start a Detectify scan on a given application. 

The "threshold" option is optional - it allows you to specify the maximum allowable threat score. Otherwise, the default is "6".

The "site" option is optional - it acts as a temporary supercharged [site override](#site-overrides) that will override the default endpoint AND any configured site overrides for the app.

`aka detectify:enable -a APPNAME`

Enable Detectify scanning for a given application

`aka detectify:disable -a APPNAME`

Disable Detectify scanning for a given application

`aka detectify:scans`

Show currently running scans

## Site Overrides

Site overrides allow users to override the endpoint that is scanned for a given app. This is useful in various situations - for example, apps that have configured CSP filters won't allow any traffic on the default app endpoint, so they will need to scan the Akkeris site instead.

Once a site override is set, any subsequent scan of the given app will use the site override URL instead of the default app endpoint.

Please note that only a single site override may be created for an app. Multi-site scans for apps are not currently supported.

### Commands

`aka detectify:sites`

Show all configured site overrides.

`aka detectify:sites:set <SITE> -a APPNAME`

Create a new site override for a given application

`aka detectify:sites:unset -a APPNAME`

Remove the site override for a given application

## Future Plans

- Show past scans using the CLI
- PDF scan results (currently, Detectify does not offer this feature programmatically)