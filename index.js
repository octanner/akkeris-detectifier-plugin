const open = require('open');

const DETECTIFIER_URL = process.env.DETECTIFIER_URL || 'https://akkeris-detectifier.octanner.io';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'detectifer';

async function start(appkit, args) {
  const app = args.app;
  const threshold = args.threshold;
  let loading = appkit.terminal.loading('Submitting request');
  try {
    const response = await appkit.terminal.question(
      appkit.terminal.markdown(`\n~~Are you sure you want to scan~~ ^^^${app}^^^ ~~?~~ (Y/N): `)
    );
    
    if (!response || !(response.toLowerCase() === 'y' || response.toLowerCase() === 'yes')) {
      console.log('Aborting...');
      return;
    } 
    
    const payload = {
      "app_name": app,
    };
    if (threshold) {
      payload.success_threshold = threshold;
    }

    loading.start();
    const result = await appkit.api.post(JSON.stringify(payload), `${DETECTIFIER_URL}/v1/scans/start`);
    loading.end();
    if (result.message) {
      console.log(result.message);
    }
  } catch (err) {
    loading.end();
    appkit.terminal.error(err);
  }
}

async function enable(appkit, args) {
  const { app, site } = args;
  
  try {
    const hooks = await appkit.api.get(`/apps/${app}/hooks`);
    const needsHook = !hooks.find(hook => hook.url === `${DETECTIFIER_URL}/v1/hook/released`);
    if (needsHook) {
      const hook = {
        url: `${DETECTIFIER_URL}/v1/hook/released`,
        active: true,
        secret: WEBHOOK_SECRET,
        events: ['released'],
      };
      await appkit.api.post(JSON.stringify(hook), `/apps/${app}/hooks`);
      if (site && site !== "") {
        await appkit.http.post(JSON.stringify({site}), `${DETECTIFIER_URL}/v1/config/${app}`, {'Content-type': 'application/json'});
      }
      console.log(appkit.terminal.markdown('^^Detectify scanning successfully enabled!^^'));
    } else {
      console.log(appkit.terminal.markdown('!!Detectify scanning is already enabled on this app!!'));
    }
  } catch (err) {
    appkit.terminal.error(err);
  }
}

async function disable(appkit, args) {
  const app = args.app;
  try {
    const hooks = await appkit.api.get(`/apps/${app}/hooks`);
    const hook = hooks.find(hook => hook.url === `${DETECTIFIER_URL}/v1/hook/released`);
    if (hook) {
      await appkit.api.delete(`/apps/${app}/hooks/${hook.id}`);
      console.log(appkit.terminal.markdown('^^Detectify scanning successfully disabled!^^'));
    } else {
      console.log(appkit.terminal.markdown('!!Detectify scanning is already disabled on this app!!'));
    }
  } catch (err) {
    appkit.terminal.error(err);
  }
}

async function scans(appkit) {
  try {
    const scans = await appkit.api.get(`${DETECTIFIER_URL}/v1/scans`);
    if (scans.length === 0) {
      console.log(appkit.terminal.markdown('!! No currently running scans. !!'));
    } else {
      const formattedScans = scans.map(scan => ({
        "App Name": scan.akkeris_app,
        "Endpoint": scan.endpoint,
        "Scan Status": scan.scan_status,
        "Started At": (new Date(scan.created_at)).toLocaleString(),
      }));
      console.log(appkit.terminal.markdown('\n^^ Currently Running Scans ^^'));
      appkit.terminal.table(formattedScans);
    }
  } catch (err) {
    appkit.terminal.error(err);
  }
}

async function showUI(appkit) {
  try {
    console.log('Opening Detectifier UI...');
    await open(DETECTIFIER_URL);
  } catch (err) {
    appkit.terminal.error(err);
  }
}

async function listSites(appkit) {
  try {
    const config = await appkit.http.get(`${DETECTIFIER_URL}/v1/config`);
    if (config.length === 0) {
      console.log(appkit.terminal.markdown('\n!! No configured site overrides. !!'));
    } else {
      const formattedConfig = config.map(c => ({
        "App Name": c.akkeris_app,
        "Site": c.site,
      }));
      console.log(appkit.terminal.markdown('\n^^ Configured Site Overrides ^^'));
      console.log(appkit.terminal.markdown('### The apps below will run scans on the associated site rather than the default app endpoint.###'))
      appkit.terminal.table(formattedConfig);
    }
  } catch (err) {
    appkit.terminal.error(err);
  }
}

async function setSite(appkit, args) {
  const { app, site } = args;
  try {
    await appkit.http.post(JSON.stringify({site}), `${DETECTIFIER_URL}/v1/config/${app}`, {'Content-type': 'application/json'});
    console.log(appkit.terminal.markdown(`\n^^✓^^ ~~${site}~~ will now be targeted for any scan on the app ^^${app}^^`))
  } catch (err) {
    appkit.terminal.error(err);
  }
}

async function removeSite(appkit, args) {
  const { app } = args;
  try {
    await appkit.http.delete(`${DETECTIFIER_URL}/v1/config/${app}`);
    console.log(appkit.terminal.markdown(`\n^^✓^^ Any scan on the app ^^${app}^^ will now use the default app endpoint.`))
  } catch (err) {
    appkit.terminal.error(err);
  }
}

function init(appkit) {
  const requireApp = {
    app: {
      alias: 'a',
      string: true,
      description: 'app name',
      demand: true,
    },
  };

  const startOptions = {
    ...requireApp,
    threshold: {
      alias: 't',
      string: true,
      description: 'success threshold',
      demand: false,
    },
    site: {
      alias: 's',
      string: true,
      description: 'site to scan instead of app endpoint',
      demand: false,
    }
  };

  const enableOptions = {
    ...requireApp,
    site: {
      alias: 's',
      string: true,
      description: 'add site override that will be scanned instead of app endpoint',
      demand: false,
    }
  }

  appkit.args
    .command('detectify:start', 'Start an immediate detectify scan on an app', startOptions, start.bind(null, appkit))
    .command('detectify:run', false, startOptions, start.bind(null,appkit))

    .command('detectify:enable', 'Enable detectify commands on an app', enableOptions, enable.bind(null, appkit))
    .command('detectify:add', false, enableOptions, enable.bind(null, appkit))
    
    .command('detectify:disable', 'Disable detectify scans on an app', requireApp, disable.bind(null, appkit))
    .command('detectify:remove', false, requireApp, disable.bind(null, appkit))

    .command('detectify:sites', 'View list of configured site overrides', {}, listSites.bind(null, appkit))
    .command('detectify:overrides', false, {}, listSites.bind(null, appkit))

    .command('detectify:sites:set <SITE>', 'Set a site override for an app', requireApp, setSite.bind(null, appkit))
    .command('detectify:sites:add <SITE>', false, requireApp, setSite.bind(null, appkit))
    .command('detectify:overrides:set <SITE>', false, requireApp, setSite.bind(null, appkit))
    .command('detectify:overrides:add <SITE>', false, requireApp, setSite.bind(null, appkit))

    .command('detectify:sites:unset', 'Remove a site override for an app', requireApp, removeSite.bind(null, appkit))
    .command('detectify:sites:remove', false, requireApp, removeSite.bind(null, appkit))
    .command('detectify:sites:destroy', false, requireApp, removeSite.bind(null, appkit))
    .command('detectify:sites:delete', false, requireApp, removeSite.bind(null, appkit))
    .command('detectify:overrides:unset', false, requireApp, removeSite.bind(null, appkit))
    .command('detectify:overrides:remove', false, requireApp, removeSite.bind(null, appkit))
    .command('detectify:overrides:destroy', false, requireApp, removeSite.bind(null, appkit))
    .command('detectify:overrides:delete', false, requireApp, removeSite.bind(null, appkit))
    
    .command('detectify:scans', 'Show currently running Detectify scans', {}, scans.bind(null, appkit))
    .command('detectify:running', false, {}, scans.bind(null, appkit))
    .command('detectify:current', false, {}, scans.bind(null, appkit))
    
    .command('detectify:ui', 'Open the Detectifier UI in a web browser', {}, showUI.bind(null, appkit));
}

module.exports = {
  init,
  update: () => {},
  group: 'detectify',
  help: 'Manage Detectify scans for applications',
  primary: true,
};
