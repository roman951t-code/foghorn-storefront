'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Mousewheel } from 'swiper/modules';
import { Link } from '@/i18n/routing';
import { PROMO_CARDS, type PromoCard } from '@/data/navigation/promoCards';
import { promoBreakpoints } from '@/data/breakpoints';
import { useRef } from 'react';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';

// Matches this slider's own container width, not a naive full-viewport vw:
// the promo panel sits next to CatalogPanel's 280px sidebar (+12px gap, from
// `md` up) inside <main maxW="1512px"> and page.tsx's mx (18px each side
// below `2xl`, see layout.tsx/page.tsx). Plain vw fractions (the previous
// version of this string) ignore both the sidebar and the 1512px cap, so
// they overshoot badly at wide viewports — measured ~50% wasted bytes on
// the hero image at a 1350px viewport. Each bucket below subtracts those
// fixed costs (divided by slidesPerView for the multi-slide ones), same
// breakpoints as `promoBreakpoints`, plus a small buffer on top of the exact
// math so a slightly-off measurement still over-fetches rather than
// under-fetches (over-fetching is harmless; under-fetching blurs the image —
// see PRODUCT_IMAGE_SIZES's own comment in ProductPreviewSlider.tsx for the
// same reasoning). Last bucket is a flat px value, not vw, since the 1512px
// cap makes the container width constant past that point.
const PROMO_IMAGE_SIZES =
	'(max-width: 689px) calc(100vw - 32px), (max-width: 767px) calc(50vw - 11px), (max-width: 1099px) calc(100vw - 324px), (max-width: 1563px) calc(50vw - 160px), 420px';

// Stable, non-reactive stand-in for PromoCardSlide's isDraggingRef when it's
// rendered as the static (non-Swiper) first-slide fallback below — nothing
// ever mutates it there, since there's no drag gesture without Swiper mounted.
const STATIC_DRAG_REF = { current: false };

type PromoProps = {
	promos?: PromoCard[];
};

function PromoCardSlide({
	promo,
	imagePriority,
	isDraggingRef,
}: {
	promo: PromoCard;
	imagePriority?: boolean;
	isDraggingRef: { current: boolean };
}) {
	const overlayContent = (
		<VStack
			gapY='3'
			bg='rgba(18,18,18,0.72)'
			alignItems='flex-start'
			backdropFilter='blur(10px)'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='rgba(255,255,255,0.2)'
			borderRadius='lg'
			p={{ base: 3.5, md: 4 }}
			maxW={{ base: '100%', md: '84%' }}
			minW='300px'
			transition='all 0.2s ease'
			_hover={{ bg: 'rgba(18,18,18,0.8)', borderColor: 'rgba(255,255,255,0.2)' }}
		>
			<Text fontSize={{ base: 'md', md: 'xl' }} fontWeight='semibold' lineClamp={2}>
				{promo.text}
			</Text>

			{promo.subtitle ? (
				<Text fontSize={{ base: 'sm', md: 'md' }} opacity={0.92} lineClamp={2}>
					{promo.subtitle}
				</Text>
			) : null}

			{promo.href ? <SecondaryButton>{promo.linkLabel ?? 'Shop now'}</SecondaryButton> : null}
		</VStack>
	);

	const overlay = promo.href ? (
		<Link
			href={promo.href}
			aria-label={promo.linkLabel ?? promo.text}
			style={{ display: 'block' }}
			onClick={(e) => {
				if (isDraggingRef.current) {
					e.preventDefault();
				}
			}}
		>
			{overlayContent}
		</Link>
	) : (
		overlayContent
	);

	return (
		<Flex
			position='relative'
			justify='flex-start'
			align='stretch'
			cursor='grab'
			_active={{ cursor: 'grabbing' }}
			bg='bg.tertiary'
			borderWidth='0.5px'
			borderStyle='solid'
			borderRadius='lg'
			height='572px'
			width='100%'
			overflow='hidden'
			transition='border-color 0.2s ease-in-out'
			role='group'
			title={promo.text}
		>
			<Box
				position='absolute'
				inset='0'
				transform='scale(1.01)'
				transition='transform 0.35s ease'
				_groupHover={{ transform: 'scale(1.06)' }}
			>
				{promo.imageUrl ? (
					<Image
						src={promo.imageUrl}
						alt=''
						fill
						priority={imagePriority}
						loading={imagePriority ? 'eager' : 'lazy'}
						fetchPriority={imagePriority ? 'high' : 'auto'}
						quality={68}
						sizes={PROMO_IMAGE_SIZES}
						style={{ objectFit: 'cover' }}
					/>
				) : null}
			</Box>
			<Box
				position='absolute'
				inset='0'
				bgGradient='linear(to-t, rgba(0,0,0,0.78), rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.0))'
			/>

			<VStack
				position='relative'
				align='flex-start'
				justify='flex-end'
				gap='0'
				p={{ base: 4, md: 6 }}
				w='100%'
				h='100%'
				color='white'
			>
				<Box cursor={promo.href ? 'pointer' : 'default'}>{overlay}</Box>
			</VStack>
		</Flex>
	);
}

function PromoSlider({ promos }: PromoProps) {
	const cards = promos && promos.length > 0 ? promos : PROMO_CARDS;
	const isDraggingRef = useRef(false);

	return (
		<Swiper
			spaceBetween={10}
			breakpoints={promoBreakpoints}
			slidesPerView={1}
			modules={[Autoplay, Mousewheel]}
			autoplay={{
				delay: 20_000,
				disableOnInteraction: false,
				pauseOnMouseEnter: true,
			}}
			loop
			className='promoSlider'
			grabCursor={true}
			simulateTouch={true}
			onTouchStart={() => {
				isDraggingRef.current = false;
			}}
			onSliderMove={() => {
				isDraggingRef.current = true;
			}}
			onTouchEnd={() => {
				// Swiper can fire a click after touch ends; release the flag on the next tick.
				setTimeout(() => {
					isDraggingRef.current = false;
				}, 0);
			}}
			mousewheel={{ forceToAxis: true }}
			touchStartPreventDefault={false}
			touchRatio={1}
		>
			{cards.map((promo, index) => (
				<SwiperSlide key={promo.id}>
					<PromoCardSlide promo={promo} imagePriority={index === 0} isDraggingRef={isDraggingRef} />
				</SwiperSlide>
			))}
		</Swiper>
	);
}

const DynamicPromoSlider = dynamic<PromoProps>(() => Promise.resolve(PromoSlider), {
	// No loading UI: the static first slide rendered below already fills this
	// space (server-rendered, so it's in the initial HTML), and it's visually
	// identical to Swiper's own first slide — showing a skeleton on top of it
	// would just flicker (real image → gray box → real image) for no benefit.
	ssr: false,
	loading: () => null,
});

export default function Promo({ promos }: PromoProps) {
	const cards = promos && promos.length > 0 ? promos : PROMO_CARDS;
	const [firstCard] = cards;

	return (
		// flex='1' matches .promoSlider's own CSS rule (swiper.css) — this Box
		// now takes over as the flex child CatalogPanel's row sizes next to the
		// 280px sidebar, since the Swiper root (still using that class below)
		// isn't the outermost element here anymore.
		<Box position='relative' flex='1'>
			{/* Server-rendered stand-in for Swiper's first slide (Swiper itself
			    is client-only below — see DynamicPromoSlider's comment). Without
			    this, the LCP hero image doesn't exist in the initial HTML at all:
			    the browser can't discover or paint it until React hydrates and
			    Swiper mounts, which measured as ~53% of this element's LCP time
			    being pure render delay. `inert` + aria-hidden take it out of the
			    accessibility tree and tab order once Swiper's real (identical)
			    first slide is layered on top, so there's exactly one reachable
			    "Shop now" link, not two. */}
			{firstCard ? (
				<Box aria-hidden='true' inert>
					<PromoCardSlide promo={firstCard} imagePriority isDraggingRef={STATIC_DRAG_REF} />
				</Box>
			) : null}
			<Box position='absolute' inset='0'>
				<DynamicPromoSlider promos={promos} />
			</Box>
		</Box>
	);
}
