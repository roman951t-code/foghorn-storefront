import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/chakra/accordion';
import { useTranslations } from 'next-intl';
import { LocaleNavLink } from '@/components/ui/links/LocaleNavLink';
import { Icon } from '@chakra-ui/react';
import { SIDEBAR_DEFAULT_ITEMS, SIDEBAR_SECTIONS } from '@/data/navigation/sidebarLinks';

interface Props {
	onClose: () => void;
	userName?: string;
	isAuthorized?: boolean;
}

export default function CollapsibleLinks({ onClose, userName, isAuthorized }: Props) {
	const navT = useTranslations('navigation');
	const defaultItems = [...SIDEBAR_DEFAULT_ITEMS];

	if (isAuthorized) {
		defaultItems.unshift('cabinet');
	}

	const handleClick = () => {
		if (onClose) onClose();
	};

	return (
		<AccordionRoot
			multiple
			defaultValue={defaultItems}
			collapsible={false}
			onValueChange={() => {}}
		>
			{SIDEBAR_SECTIONS.filter((section) => !section.requiresAuth || isAuthorized).map(
				(section) => (
					<AccordionItem key={section.value} value={section.value} borderBottomColor='border.light'>
						<AccordionItemTrigger fontSize='17px' mb='2'>
							{navT(`sidebar.${section.value}`)}
						</AccordionItemTrigger>
						{section.links.map((link) => {
							const IconComponent = link.icon;
							const label = link.useUserName ? userName ?? navT(link.labelKey) : navT(link.labelKey);
							return (
								<AccordionItemContent key={link.href}>
									<LocaleNavLink href={link.href} onClick={handleClick}>
										<Icon as={IconComponent} size='md' mr='2' />
										{label}
									</LocaleNavLink>
								</AccordionItemContent>
							);
						})}
					</AccordionItem>
				)
			)}
		</AccordionRoot>
	);
}
