import { useEffect, useState } from 'react';
import { ApiClient, type ActionProps, OriginalShow, useTranslation } from 'adminjs';
import { Box, Text } from '@adminjs/design-system';

const api = new ApiClient();

type ReviewProductPayload = {
	productId: string;
	productName: string;
	productImageUrl: string | null;
	productStatus: string;
};

const resolvePath = (path: string) => {
	if (typeof window === 'undefined') return path;
	const globalAny = window as typeof window & {
		REDUX_STATE?: { paths?: { rootPath?: string } };
	};
	const rootPath = globalAny.REDUX_STATE?.paths?.rootPath ?? '';
	const normalizedRoot = rootPath.replace(/\/$/, '');
	const normalizedPath = path.replace(/^\//, '');
	if (!normalizedRoot) return path;
	return `${normalizedRoot}/${normalizedPath}`;
};

export default function ReviewShow(props: ActionProps) {
	const { record, resource } = props;
	const recordId = record?.id;
	const { translateLabel, translateMessage } = useTranslation();
	const [productPayload, setProductPayload] = useState<ReviewProductPayload | null>(null);
	const [loading, setLoading] = useState(false);

	const resolveStatusLabel = (status: string) => {
		if (!status) return '-';
		const translated = translateLabel(`status.${status}`, 'Product');
		return translated && translated !== `status.${status}` ? translated : status;
	};

	useEffect(() => {
		if (!recordId) return;
		let isActive = true;
		setLoading(true);
		api
			.recordAction({
				resourceId: resource.id,
				recordId,
				actionName: 'reviewProduct',
				method: 'get',
			})
			.then((response) => {
				if (!isActive) return;
				setProductPayload((response.data.payload ?? null) as ReviewProductPayload | null);
			})
			.finally(() => {
				if (!isActive) return;
				setLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [recordId, resource.id]);

	return (
		<Box>
			<Box
				variant='white'
				p='xxl'
				borderRadius='xl'
				boxShadow='sm'
				mb='xl'
				style={{ border: '1px solid #E2E8F0' }}
			>
				<Text fontWeight='bold' mb='lg'>
					{translateMessage('review-product-title')}
				</Text>
				{loading || !productPayload ? (
					<Text color='grey60'>{translateMessage('review-product-loading')}</Text>
				) : productPayload.productId ? (
					<Box
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: 12,
							padding: '12px 14px',
							borderRadius: 10,
							border: '1px solid #E2E8F0',
						}}
					>
						<Box style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
							<Box
								style={{
									width: 76,
									height: 76,
									borderRadius: 10,
									overflow: 'hidden',
									background: '#F1F5F9',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
								}}
							>
								{productPayload.productImageUrl ? (
									<img
										src={productPayload.productImageUrl}
										alt={productPayload.productName || 'Product thumbnail'}
										loading='lazy'
										style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
									/>
								) : (
									<Text fontWeight='bold' color='grey60'>
										{productPayload.productName?.slice(0, 1) ?? '?'}
									</Text>
								)}
							</Box>
							<Box style={{ minWidth: 0 }}>
								<a
									href={resolvePath(`resources/Product/records/${productPayload.productId}/show`)}
									style={{ fontWeight: 600, display: 'block' }}
								>
									{productPayload.productName}
								</a>
								<Text color='grey60' style={{ fontSize: 15 }}>
									{resolveStatusLabel(productPayload.productStatus)}
								</Text>
							</Box>
						</Box>
					</Box>
				) : (
					<Text color='grey60'>{translateMessage('review-product-empty')}</Text>
				)}
			</Box>

			<OriginalShow {...props} />
		</Box>
	);
}
