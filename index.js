const DETECTIFIER_URL = process.env.DETECTIFIER_URL || 'https://akkeris-detectifier.octanner.io';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'detectifer';

async function enable(appkit, args) {
  const app = args.app;
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
      console.log(appkit.terminal.markdown('^^ Detectify scanning successfully enabled! ^^'));
    } else {
      console.log(appkit.terminal.markdown('!! Detectify scanning is already enabled on this app !!'));
    }
  } catch (err) {
    console.log(appkit.terminal.error(err));
  }
}

async function disable(appkit) {
  const app = args.app;
  try {
    const hooks = await appkit.api.get(`/apps/${app}/hooks`);
    const hook = hooks.find(hook => hook.url === `${DETECTIFIER_URL}/v1/hook/released`);
    if (hook) {
      await appkit.api.delete(`/apps/${app}/hooks/${hook.id}`);
      console.log(appkit.terminal.markdown('^^ Detectify scanning successfully disabled! ^^'));
    } else {
      console.log(appkit.terminal.markdown('!! Detectify scanning is already disabled on this app !!'));
    }
  } catch (err) {
    console.log(appkit.terminal.error(err));
  }
}

async function scans(appkit) {
  try {
    const scans = await appkit.api.get(`${DETECTIFIER_URL}/v1/scans`);
    if (scans.length === 0) {
      console.log(appkit.terminal.markdown('!! No currently running scans. !!'));
    } else {
      const formattedScans = scans.map(scan => ({
        "App Name": scan.app_name,
        "Endpoint": scan.endpoint,
        "Scan Status": scan.scan_status,
        "Started At": (new Date(scan.created_at)).toLocaleString(),
      }));
      console.log(appkit.terminal.markdown('\n^^ Currently Running Scans ^^'))
      appkit.terminal.table(formattedScans)
    }
  } catch (err) {
    console.log(appkit.terminal.error(err));
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

  appkit.args
    .command('detectify:enable', 'Enable detectify commands on an app', requireApp, enable.bind(null, appkit))
    .command('detectify:add', false, requireApp, enable.bind(null, appkit))
    .command('detectify:start', false, requireApp, enable.bind(null, appkit))
    
    .command('detectify:disable', 'Disable detectify scans on an app', requireApp, disable.bind(null, appkit))
    .command('detectify:remove', false, requireApp, disable.bind(null, appkit))
    .command('detectify:stop', false, requireApp, disable.bind(null, appkit))

    .command('detectify:scans', 'Show currently running Detectify scans', {}, scans.bind(null, appkit))
    .command('detectify:running', false, {}, scans.bind(null, appkit))
    .command('detectify:current', false, {}, scans.bind(null, appkit));
}

module.exports = {
  init,
  update: () => {},
  group: 'detectify',
  help: 'Manage Detectify scans for applications',
  primary: true,
};
