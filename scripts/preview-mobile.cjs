const { spawn } = require('node:child_process');
const os = require('node:os');

const port = process.env.PORT || '3000';
const npmCommand = 'npm';
const npxCommand = 'npx';
const useShell = process.platform === 'win32';

const isPrivateLanIp = (ip) =>
	ip.startsWith('192.168.') || ip.startsWith('10.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);

const virtualInterfacePattern = /virtual|vethernet|wsl|docker|hyper-v|loopback|vmware|virtualbox/i;

const candidates = Object.entries(os.networkInterfaces())
	.flatMap(([name, addresses]) =>
		(addresses || [])
			.filter(
				(address) =>
					address.family === 'IPv4' && !address.internal && isPrivateLanIp(address.address),
			)
			.map((address) => ({ name, address: address.address })),
	)
	.sort((a, b) => {
		const aVirtual = virtualInterfacePattern.test(a.name);
		const bVirtual = virtualInterfacePattern.test(b.name);
		if (aVirtual !== bVirtual) return aVirtual ? 1 : -1;
		const aWifi = /wi-?fi|wireless|wlan/i.test(a.name);
		const bWifi = /wi-?fi|wireless|wlan/i.test(b.name);
		if (aWifi !== bWifi) return aWifi ? -1 : 1;
		const aCommonHomeLan = a.address.startsWith('192.168.');
		const bCommonHomeLan = b.address.startsWith('192.168.');
		if (aCommonHomeLan !== bCommonHomeLan) return aCommonHomeLan ? -1 : 1;
		return a.name.localeCompare(b.name);
	});

const lanIp = process.env.MOBILE_PREVIEW_HOST || candidates[0]?.address;

if (!lanIp) {
	console.error(
		'No LAN IPv4 address was found. Connect this computer to Wi-Fi/Ethernet and retry.',
	);
	process.exit(1);
}

const previewUrl = process.env.MOBILE_PREVIEW_APP_URL || `http://${lanIp}:${port}`;
const previewHost = new URL(previewUrl).host;

const allowedHosts = new Set(
	[
		process.env.ALLOWED_APP_HOSTS,
		'localhost',
		`localhost:${port}`,
		'127.0.0.1',
		`127.0.0.1:${port}`,
		lanIp,
		`${lanIp}:${port}`,
		previewHost,
	]
		.filter(Boolean)
		.flatMap((value) => String(value).split(','))
		.map((value) => value.trim())
		.filter(Boolean),
);

const env = {
	...process.env,
	PORT: port,
	LOCAL_NETWORK_PREVIEW: 'true',
	NEXT_PUBLIC_APP_URL: previewUrl,
	ALLOWED_APP_HOSTS: Array.from(allowedHosts).join(','),
};

const run = (command, args) =>
	new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			stdio: 'inherit',
			env,
			shell: useShell,
		});

		child.on('exit', (code, signal) => {
			if (code === 0) {
				resolve();
				return;
			}

			reject(new Error(`${command} ${args.join(' ')} failed${signal ? ` (${signal})` : ''}`));
		});

		child.on('error', reject);
	});

(async () => {
	console.log(`Mobile preview host: ${previewUrl}`);
	console.log(`Allowed app hosts: ${env.ALLOWED_APP_HOSTS}`);
	if (candidates.length > 1) {
		console.log('Detected LAN addresses:');
		for (const candidate of candidates) {
			console.log(`- ${candidate.name}: ${candidate.address}`);
		}
		console.log('If the printed URL does not open on your phone, retry with:');
		console.log('$env:MOBILE_PREVIEW_HOST="<your-wifi-ip>"; npm run preview:mobile');
	}

	await run(npmCommand, ['run', 'build']);

	console.log('Build complete. Open this URL on your iPad/smartphone while on the same Wi-Fi:');
	console.log(previewUrl);

	await run(npxCommand, ['next', 'start', '-H', '0.0.0.0', '-p', port]);
})().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
