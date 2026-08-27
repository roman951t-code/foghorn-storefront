import { v2 as cloudinary } from 'cloudinary';

const DEFAULT_UPLOAD_FOLDER = 'online-store/products';

type CloudinaryConfigState = {
	configured: boolean;
	enabled: boolean;
	cloudName: string | null;
};

type CloudinaryImageUploadResult =
	| { ok: true; url: string; uploaded: boolean; publicId: string | null }
	| { ok: false; error: string };

const cloudinaryState: CloudinaryConfigState = {
	configured: false,
	enabled: false,
	cloudName: null,
};

const normalizeText = (value: string | undefined | null) => {
	if (!value) return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

const parseCloudinaryUrl = (value: string | null) => {
	if (!value) return null;
	const match = value.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)$/);
	if (!match) return null;
	const apiKey = normalizeText(decodeURIComponent(match[1] ?? ''));
	const apiSecret = normalizeText(decodeURIComponent(match[2] ?? ''));
	const cloudName = normalizeText(decodeURIComponent(match[3] ?? ''));
	if (!apiKey || !apiSecret || !cloudName) return null;
	return { apiKey, apiSecret, cloudName };
};

const resolveCloudinaryConfig = () => {
	if (cloudinaryState.configured) return cloudinaryState;

	cloudinaryState.configured = true;

	const cloudinaryUrl = normalizeText(process.env.CLOUDINARY_URL);
	const parsedCloudinaryUrl = parseCloudinaryUrl(cloudinaryUrl);
	const cloudName =
		normalizeText(process.env.CLOUDINARY_CLOUD_NAME) ?? parsedCloudinaryUrl?.cloudName ?? null;
	const apiKey =
		normalizeText(process.env.CLOUDINARY_API_KEY) ?? parsedCloudinaryUrl?.apiKey ?? null;
	const apiSecret =
		normalizeText(process.env.CLOUDINARY_API_SECRET) ?? parsedCloudinaryUrl?.apiSecret ?? null;

	if (!cloudName || !apiKey || !apiSecret) {
		cloudinaryState.enabled = false;
		return cloudinaryState;
	}

	cloudinary.config({
		cloud_name: cloudName,
		api_key: apiKey,
		api_secret: apiSecret,
		secure: true,
	});
	cloudinaryState.cloudName = cloudName;
	cloudinaryState.enabled = true;
	return cloudinaryState;
};

const isRemoteImageSource = (value: string) =>
	value.startsWith('data:') || /^https?:\/\//i.test(value);

const toSafePublicIdPart = (value: string | undefined) =>
	(value ?? '')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');

const getUploadFolder = () =>
	normalizeText(process.env.CLOUDINARY_UPLOAD_FOLDER) ?? DEFAULT_UPLOAD_FOLDER;

const isSameCloudinaryDeliveryUrl = (url: string, cloudName: string | null) => {
	if (!cloudName) return false;
	try {
		const parsed = new URL(url);
		if (parsed.hostname !== 'res.cloudinary.com') return false;
		return parsed.pathname.includes(`/${cloudName}/`);
	} catch {
		return false;
	}
};

const toErrorMessage = (error: unknown) => {
	if (error instanceof Error) return error.message;
	return String(error);
};

export const uploadProductImageToCloudinary = async ({
	sourceUrl,
	productCode,
	productSlug,
	assetKey = 'primary',
}: {
	sourceUrl: string;
	productCode?: string;
	productSlug?: string;
	assetKey?: string;
}): Promise<CloudinaryImageUploadResult> => {
	const normalizedSourceUrl = normalizeText(sourceUrl);
	if (!normalizedSourceUrl) {
		return { ok: true, url: sourceUrl, uploaded: false, publicId: null };
	}

	const config = resolveCloudinaryConfig();
	if (!config.enabled) {
		return { ok: true, url: normalizedSourceUrl, uploaded: false, publicId: null };
	}
	if (!isRemoteImageSource(normalizedSourceUrl)) {
		return { ok: true, url: normalizedSourceUrl, uploaded: false, publicId: null };
	}
	if (isSameCloudinaryDeliveryUrl(normalizedSourceUrl, config.cloudName)) {
		return { ok: true, url: normalizedSourceUrl, uploaded: false, publicId: null };
	}

	const publicIdBase =
		toSafePublicIdPart(productCode) || toSafePublicIdPart(productSlug) || `product-${Date.now()}`;
	const uploadFolder = getUploadFolder();
	const safeAssetKey = toSafePublicIdPart(assetKey) || 'asset';
	const publicId = `${publicIdBase}-${safeAssetKey}`;

	try {
		const uploaded = await cloudinary.uploader.upload(normalizedSourceUrl, {
			folder: uploadFolder,
			public_id: publicId,
			overwrite: true,
			invalidate: true,
			resource_type: 'image',
			unique_filename: false,
			use_filename: false,
		});
		return {
			ok: true,
			url: uploaded.secure_url || uploaded.url || normalizedSourceUrl,
			uploaded: true,
			publicId: uploaded.public_id ?? publicId,
		};
	} catch (error) {
		return { ok: false, error: toErrorMessage(error) };
	}
};
