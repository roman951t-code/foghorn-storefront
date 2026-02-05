'use client';

import dynamic from 'next/dynamic';
import { Box, Flex, HStack, Text, VStack, useBreakpointValue } from '@chakra-ui/react';
import { LoadingPromoSkeleton } from '@/components/ui/Skeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Mousewheel } from 'swiper/modules';
import { Link } from '@/i18n/routing';
import { PROMO_CARDS, type PromoCard } from '@/data/navigation/promoCards';
import { promoBreakpoints } from '@/data/breakpoints';
import { useRef } from 'react';

import 'swiper/css';
import { SecondaryButton } from '@/components/ui/buttons/ActionButton';

function PromoSkeletonFallback() {
	const skeletonCount = useBreakpointValue({ base: 1, sm: 2, md: 1, lg: 2 }) ?? 4;

	return (
		<HStack gap='4' mt='8' overflowX='auto' overflowY='hidden' w='100%'>
			{Array.from({ length: skeletonCount }).map((_, i) => (
				<LoadingPromoSkeleton key={i} />
			))}
		</HStack>
	);
}

type PromoProps = {
	promos?: PromoCard[];
};

function PromoCardSlide({
	promo,
	isDraggingRef,
}: {
	promo: PromoCard;
	isDraggingRef: { current: boolean };
}) {
	const overlayContent = (
		<VStack
			gapY='3'
			bg='rgba(24,24,24,0.5)'
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
			_hover={{ bg: 'rgba(24,24,24,0.62)', borderColor: 'rgba(255,255,255,0.20)' }}
		>
			<Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight='semibold' lineClamp={2}>
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
			borderColor={{ base: 'border', _dark: 'border' }}
			borderRadius='lg'
			height='516px'
			width='100%'
			overflow='hidden'
			boxShadow='none'
			transition='border-color 0.2s ease-in-out'
			_hover={{ borderColor: 'main.secondary' }}
			role='group'
			title={promo.text}
		>
			<Box
				position='absolute'
				inset='0'
				bgImage={promo.imageUrl ? `url(${promo.imageUrl})` : undefined}
				bgSize='cover'
				bgPos='center'
				bgRepeat='no-repeat'
				transform='scale(1.01)'
				transition='transform 0.35s ease'
				_groupHover={{ transform: 'scale(1.06)' }}
			/>
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
			spaceBetween={6}
			breakpoints={promoBreakpoints}
			slidesPerView={1}
			modules={[Autoplay, Mousewheel]}
			autoplay={false}
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
			{cards.map((promo) => (
				<SwiperSlide key={promo.id}>
					<PromoCardSlide promo={promo} isDraggingRef={isDraggingRef} />
				</SwiperSlide>
			))}
		</Swiper>
	);
}

const DynamicPromoSlider = dynamic<PromoProps>(() => Promise.resolve(PromoSlider), {
	ssr: false,
	loading: () => <PromoSkeletonFallback />,
});

export default function Promo({ promos }: PromoProps) {
	return <DynamicPromoSlider promos={promos} />;
}
