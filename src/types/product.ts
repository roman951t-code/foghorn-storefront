export interface Product {
	id: string;
	name: string;
	price: number;
}

export type Category = {
	id: string;
	name: string;
	slug: string;
	children: {
		id: string;
		name: string;
		slug: string;
	}[];
};
