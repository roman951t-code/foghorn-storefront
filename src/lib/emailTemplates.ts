import 'server-only';

import { Resend } from 'resend';
import { env } from '@/config/env';

export const resendClient = new Resend(env.RESEND_API_KEY);
export const DEFAULT_FROM = env.EMAIL_FROM ?? 'Online Store <onboarding@resend.dev>';

type DetailRow = {
	label: string;
	value: string;
};

type EmailContent = {
	subject: string;
	title: string;
	salutation: string;
	intro: string[];
	detailRows?: DetailRow[];
	listTitle?: string;
	listItems?: string[];
	outro?: string[];
	cta?: { label: string; url: string };
	footer?: string;
	brandName?: string;
};

const baseFont = "font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;";

const escapeHtml = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\"/g, '&quot;')
		.replace(/'/g, '&#39;');

const escapeUrl = (value: string) => escapeHtml(encodeURI(value));

const buildText = (content: EmailContent) => {
	const blocks: string[] = [];
	if (content.salutation) blocks.push(content.salutation);
	blocks.push(...content.intro.filter(Boolean));

	if (content.detailRows?.length) {
		blocks.push(
			content.detailRows
				.map((row) => `${row.label}: ${row.value}`)
				.join('\n')
		);
	}

	if (content.listItems?.length) {
		if (content.listTitle) blocks.push(content.listTitle);
		blocks.push(content.listItems.map((item) => `• ${item}`).join('\n'));
	}

	if (content.outro?.length) blocks.push(...content.outro.filter(Boolean));
	if (content.footer) blocks.push(content.footer);

	return blocks.join('\n\n').trim();
};

export function renderEmailTemplate(content: EmailContent) {
	const brandName = escapeHtml(content.brandName ?? 'Online Store');
	const detailRowsHtml =
		content.detailRows && content.detailRows.length
			? `<div style="margin-top:16px;padding:14px;border:1px solid #e5e7eb;border-radius:10px;background:#f8fafc;">
					<table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0 10px;">
						${content.detailRows
							.map(
								(row) => `
							<tr>
								<td style="${baseFont}font-size:15px;color:#475467;padding:8px 10px 8px 0;width:45%;vertical-align:top;">${escapeHtml(
									row.label
								)}</td>
								<td style="${baseFont}font-weight:600;font-size:15px;color:#111827;padding:8px 0 8px 10px;vertical-align:top;text-align:right;">${escapeHtml(
									row.value
								)}</td>
							</tr>`
							)
							.join('')}
					</table>
				</div>`
			: '';

	const listSectionHtml =
		content.listItems && content.listItems.length
			? `<div style="margin-top:16px;">
					${content.listTitle ? `<p style="${baseFont}margin:0 0 6px;font-weight:600;color:#111827;font-size:15px;">${escapeHtml(content.listTitle)}</p>` : ''}
					<ul style="margin:0 0 0 16px;padding:0;">
						${content.listItems
							.map(
								(item) =>
									`<li style="${baseFont}font-size:15px;line-height:20px;color:#111827;margin-bottom:6px;">${escapeHtml(
										item
									)}</li>`
							)
							.join('')}
					</ul>
				</div>`
			: '';

	const outroHtml =
		content.outro && content.outro.length
			? `<div style="margin-top:18px;">
					${content.outro
						.map(
							(line) =>
								`<p style="${baseFont}margin:0 0 10px;font-size:15px;color:#374151;line-height:20px;">${escapeHtml(
									line
								)}</p>`
						)
						.join('')}
				</div>`
			: '';

	const ctaHtml = content.cta
		? `<div style="margin-top:20px;">
				<a href="${escapeUrl(content.cta.url)}" style="${baseFont}display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">
					${escapeHtml(content.cta.label)}
				</a>
			</div>`
		: '';

	const footerHtml = content.footer
		? `<div style="padding:14px 22px;border-top:1px solid #e5e7eb;background:#f8fafc;color:#475467;${baseFont}font-size:15px;line-height:19px;">
				${escapeHtml(content.footer)}<br />${brandName}
			</div>`
		: '';

	const html = `
		<div style="background:#eef2f7;padding:24px;">
			<div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
				<div style="background:#111827;color:#ffffff;padding:16px 22px;${baseFont}font-weight:700;font-size:18px;letter-spacing:-0.01em;">
					${escapeHtml(content.title)}
				</div>
				<div style="padding:22px;${baseFont}color:#111827;">
					<p style="${baseFont}margin:0 0 12px;font-size:15px;color:#6b7280;">${brandName}</p>
					<p style="${baseFont}margin:0 0 12px;font-size:15px;font-weight:600;color:#0f172a;">${escapeHtml(
						content.salutation
					)}</p>
					${content.intro
						.map(
							(line) =>
								`<p style="${baseFont}margin:0 0 12px;font-size:15px;line-height:21px;color:#1f2937;">${escapeHtml(
									line
								)}</p>`
						)
						.join('')}
					${detailRowsHtml}
					${listSectionHtml}
					${outroHtml}
					${ctaHtml}
				</div>
				${footerHtml}
			</div>
		</div>
	`;

	const text = buildText(content);

	return { subject: content.subject, html, text };
}
