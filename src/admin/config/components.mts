import { ComponentLoader } from 'adminjs';
import path from 'path';
import { fileURLToPath } from 'url';

const adminDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const componentLoader = new ComponentLoader();
const orderStatusActionComponent = componentLoader.add(
	'OrderStatusAction',
	path.join(adminDir, 'components', 'OrderStatusAction')
);
const cancelOrderActionComponent = componentLoader.add(
	'CancelOrderAction',
	path.join(adminDir, 'components', 'CancelOrderAction')
);
const dashboardComponent = componentLoader.add(
	'Dashboard',
	path.join(adminDir, 'components', 'Dashboard')
);
componentLoader.override('Login', path.join(adminDir, 'components', 'Login'));
componentLoader.override('LoggedIn', path.join(adminDir, 'components', 'LoggedIn'));
componentLoader.override('TopBar', path.join(adminDir, 'components', 'TopBar'));

export { componentLoader, orderStatusActionComponent, cancelOrderActionComponent, dashboardComponent };
