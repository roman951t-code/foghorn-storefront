import type { ShowPropertyProps } from 'adminjs';
import { Box, Text } from '@adminjs/design-system';

export default function ProductNameList(props: ShowPropertyProps) {
	const { record, property } = props;
	const name = String(record.params[property.path] ?? '');
	const imageUrl = (record.params.imageUrl as string | null | undefined) ?? null;

	return (
		<Box style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260 }}>
			<Box
				style={{
					width: 76,
					height: 76,
					borderRadius: 10,
					border: '1px solid #E2E8F0',
					background: '#F8FAFC',
					overflow: 'hidden',
					flexShrink: 0,
				}}
			>
				{imageUrl ? (
					<img
						src={imageUrl}
						alt=''
						style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
						loading='lazy'
					/>
				) : null}
			</Box>
			<Box style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
				<Text style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
					{name}
				</Text>
			</Box>
		</Box>
	);
}
