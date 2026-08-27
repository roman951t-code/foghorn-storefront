import { Box, Flex, Link, Marquee, Text, Badge } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import PromoStripeAnimatedText from './PromoStripeAnimatedTextLazy';
import type { AppLocale } from '@/constants/locales';

const PROMO_CONTACT_URL = 'https://foghornbay.com/contact';

export default async function PromoStripe({ locale }: { locale: AppLocale }) {
	const t = await getTranslations({ locale, namespace: 'promoStripe' });
	const phrases = t.raw('phrases') as string[];
	const cta = t('cta');
	const demoLabel = t('demoLabel');

	if (!phrases?.length) return null;

	return (
		// Two nested boxes mirroring the same maxW+center then responsive-margin
		// structure the rest of the page uses (see <main> and page.tsx's own
		// wrapping Flex) — this is what makes this card's edges land exactly
		// where the product grid's do, instead of a separate hand-picked width.
		// w='full' is load-bearing, not decorative: this Box is a direct flex
		// item of the root layout's column flex container, and a flex item
		// with mx='auto' but no explicit width shrinks to its content size
		// instead of stretching (auto margins opt it out of the default
		// align-items: stretch) — same reason <main> in layout.tsx sets it.
		<Box w='full' maxW='1512px' mx='auto' my={{ base: '3', md: '4' }}>
			<Box
				as='aside'
				mx={{ base: '18px', '2xl': 0 }}
				borderWidth='1px'
				borderStyle='solid'
				borderColor='border'
				rounded='xl'
				bg='bg.tertiary'
				aria-label={cta}
			>
				<Flex
					direction={{ base: 'column', sm: 'row' }}
					px={4}
					py='10px'
					align='center'
					justify='center'
					gap={{ base: '2', sm: '4' }}
					fontSize={{ base: 'xs', sm: 'sm' }}
					fontWeight='semibold'
					textAlign='center'
				>
					{/* "Demo version" label, mirroring the CTA's slot on the opposite
					    side. Same responsive type scale as the phrase/CTA (inherited
					    from this Flex) so it reads as a natural sibling, and stacks
					    above the phrase on narrow screens instead of disappearing. */}
					<Badge
						as='span'
						flexShrink={0}
						fontSize='md'
						fontWeight='md'
						color='main'
						overflow='hidden'
						px='0'
						w={{ base: '108px', sm: '128px' }}
					>
						<Marquee.Root
							w='full'
							speed={50}
							autoFill
							pauseOnInteraction
							translations={{ root: demoLabel }}
						>
							<Marquee.Viewport>
								<Marquee.Content>
									<Marquee.Item px='2'>{demoLabel}</Marquee.Item>
								</Marquee.Content>
							</Marquee.Viewport>
						</Marquee.Root>
					</Badge>

					{/* flexBasis 0 + flexGrow 1 (not shrink-to-content) so this box's
					    width is always "whatever space the row has left after the CTA
					    and its mirror above" — fixed for any given viewport, so it
					    doesn't move as TypeAnimation types/deletes characters inside it
					    (otherwise the CTA next to it, centered as part of the same
					    group, shifts left and right with every keystroke and becomes
					    hard to click). Taking the *maximum* available space (rather
					    than a small reserved column) also means this only wraps to a
					    second line as a last resort, once even the full row can't fit
					    the phrase — below sm the CTA drops to its own line first (see
					    Flex direction above) and gives this the entire row before that
					    happens. */}
					<Text
						as='span'
						fontSize='md'
						fontWeight='md'
						minW={0}
						width={{ base: '100%', sm: 'auto' }}
						flexGrow={{ base: 0, sm: 1 }}
						flexShrink={1}
						flexBasis={{ base: 'auto', sm: '0%' }}
						wordBreak='break-word'
						textAlign='center'
					>
						<PromoStripeAnimatedText phrases={phrases} />
					</Text>
					<Link
						href={PROMO_CONTACT_URL}
						target='_blank'
						rel='noopener noreferrer'
						flexShrink={0}
						variant='underline'
						transition='all .15s ease-in-out'
						textDecorationColor='main'
						_hover={{ color: 'link' }}
					>
						{cta}
					</Link>
				</Flex>
			</Box>
		</Box>
	);
}
