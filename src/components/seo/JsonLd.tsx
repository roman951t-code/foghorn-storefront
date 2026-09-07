type JsonLdProps = {
	id: string;
	data: unknown;
	nonce?: string;
};

export default function JsonLd({ id, data, nonce }: JsonLdProps) {
	return (
		<script
			id={id}
			nonce={nonce}
			type='application/ld+json'
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data).replace(/</g, '\\u003c'),
			}}
		/>
	);
}
