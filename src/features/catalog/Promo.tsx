'use client';

import dynamic from 'next/dynamic';
import { Flex, HStack, Text, useBreakpointValue } from '@chakra-ui/react';
import { LoadingPromoSkeleton } from '@/components/ui/Skeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Link } from '@/i18n/routing';
import { PROMO_CARDS, type PromoCard } from '@/data/navigation/promoCards';
import { promoBreakpoints } from '@/data/breakpoints';

import 'swiper/css';

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

function PromoSlider({ promos }: PromoProps) {
	const cards = promos && promos.length > 0 ? promos : PROMO_CARDS;

	return (
		<Swiper
			spaceBetween={6}
			breakpoints={promoBreakpoints}
			modules={[Autoplay]}
			autoplay={false}
			loop
			className='promoSlider'
			grabCursor={true}
			simulateTouch={true}
			touchStartPreventDefault={false}
			touchRatio={1}
		>
			{cards.map((promo) => (
				<SwiperSlide key={promo.id}>
					<Flex
						justify='center'
						align='center'
						cursor='grab'
						bg='bg.tertiary'
						bgImage={promo.imageUrl ? `url(${promo.imageUrl})` : undefined}
						bgSize='cover'
						position='center'
						bgRepeat='no-repeat'
						border='1px solid'
						borderColor='border'
						borderRadius='md'
						height='472px'
						width='100%'
						color='main'
						fontWeight='400'
						fontSize='xl'
						textAlign='center'
						boxShadow='md'
						p={6}
						transition='all 0.2s ease-in-out'
						// _hover={{ bg: 'bgHover.promoCard' }}
						title={promo.text}
						role='group'
					>
						<Text _groupHover={{ color: 'link' }} bg='bg' px='2' rounded='sm'>
							{promo.href ? <Link href={promo.href}>{promo.text}</Link> : promo.text}
						</Text>
					</Flex>
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
